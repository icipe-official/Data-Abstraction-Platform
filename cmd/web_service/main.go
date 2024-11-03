package main

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log/slog"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/go-chi/httplog/v2"
	intpkgdatabase "github.com/icipe-official/Data-Abstraction-Platform/internal/pkg/database"
	intpkglib "github.com/icipe-official/Data-Abstraction-Platform/internal/pkg/lib"
	intpkglog "github.com/icipe-official/Data-Abstraction-Platform/internal/pkg/log"
	intpkgutils "github.com/icipe-official/Data-Abstraction-Platform/internal/pkg/utils"
	intwsrouters "github.com/icipe-official/Data-Abstraction-Platform/internal/web_service_routers"
)

func main() {
	// Contains common values/variables to be accessed across routes like logging, and database connnections.
	webService := new(intpkglib.WebService)
	webService.Logger = httplog.NewLogger(intpkglog.GetLogServiceName("web-service"), httplog.Options{
		JSON:             intpkglog.GetLogOptionBool("LOG_USE_JSON"),
		LogLevel:         slog.Level(intpkglog.GetLogLevel()),
		Concise:          intpkglog.GetLogOptionBool("LOG_COINCISE"),
		RequestHeaders:   intpkglog.GetLogOptionBool("LOG_REQUEST_HEADERS"),
		MessageFieldName: "message",
		TimeFieldFormat:  time.RFC3339,
		Tags: map[string]string{
			"version": os.Getenv("LOG_APP_VERSION"),
		},
	})

	// Verify env variables, Set website directory, verify iam keys, and initialize website manifest.
	func() {
		logAttribute := slog.Attr{Key: intpkglog.SectionAttrKey, Value: slog.StringValue("startup")}

		// Verify env variables
		webService.Logger.Log(context.TODO(), slog.Level(2), "Checking required env variables...", logAttribute)
		if missingEnvVariables := intpkgutils.CheckRequiredEnvVariables([]string{
			"WEB_SERVICE_CORS_URLS",
			"WEB_SERVICE_PORT",
			"PSQL_DATABASE_URI",
			"REDIS_HOST_PORT",
			"IAM_ACCESS_REFRESH_TOKEN",
			"IAM_ENCRYPTION_KEY",
			"WEBSITE_DIRECTORY",
		}); len(missingEnvVariables) > 0 {
			webService.Logger.Log(context.TODO(), slog.LevelError, fmt.Sprintf("Following env variables not set: %+q", missingEnvVariables), logAttribute)
			os.Exit(1)
		}

		webService.Logger.Log(context.TODO(), slog.Level(2), "Setting up paths to html pages...", logAttribute)
		htmlPagesFilePath := fmt.Sprintf("%v/html_pages.json", os.Getenv("WEBSITE_DIRECTORY"))
		htmlPagesFile, err := os.Open(htmlPagesFilePath)
		if err != nil {
			webService.Logger.Log(context.TODO(), slog.LevelError, fmt.Sprintf("Open %v failed | Reason: %v", htmlPagesFilePath, err), logAttribute)
			os.Exit(1)
		}

		// Initialize html entrypoints  found in $WEBSITE_DIRECTORY
		webService.HtmlPages = make(map[string]string)
		manifestBytes, err := io.ReadAll(htmlPagesFile)
		if err != nil {
			webService.Logger.Log(context.TODO(), slog.LevelError, fmt.Sprintf("Read contents of %v failed | Reason: %v", htmlPagesFilePath, err), logAttribute)
			os.Exit(1)
		} else {
			if err = json.Unmarshal(manifestBytes, &webService.HtmlPages); err != nil {
				webService.Logger.Log(context.TODO(), slog.LevelError, fmt.Sprintf("Read contents of %v failed | Reason: %v", htmlPagesFilePath, err), logAttribute)
				os.Exit(1)
			}
		}
	}()

	// Initialize database clients
	func() {
		logAttribute := slog.Attr{Key: intpkglog.SectionAttrKey, Value: slog.StringValue("startup")}

		webService.Logger.Log(context.TODO(), slog.Level(2), "Setting up database clients...", logAttribute)

		// Setup postgres connection pool
		if newPgxPool, err := intpkgdatabase.NewPgxPool(context.TODO()); err != nil {
			webService.Logger.Log(context.TODO(), slog.LevelError, fmt.Sprintf("Setup postgres connection pool failed, error: %v", err), logAttribute)
			os.Exit(1)
		} else {
			webService.PgxPool = newPgxPool
			if err := webService.PgxPool.Ping(context.TODO()); err != nil {
				webService.Logger.Log(context.TODO(), slog.LevelWarn, fmt.Sprintf("Ping postgres database failed, error: %v", err), logAttribute)
			} else {
				webService.Logger.Log(context.TODO(), slog.LevelInfo, "Ping postgres database successful", logAttribute)
			}
		}

		// Setup redis client
		if newRedisClient, err := intpkgdatabase.NewRedisClient(); err != nil {
			webService.Logger.Log(context.TODO(), slog.LevelError, fmt.Sprintf("Setup redis client failed, error: %v", err), logAttribute)
			os.Exit(1)
		} else {
			webService.RedisClient = newRedisClient
			if redisStatusResult, err := webService.RedisClient.Ping(context.TODO()).Result(); err != nil {
				webService.Logger.Log(context.TODO(), slog.LevelWarn, fmt.Sprintf("Ping redis server failed, error: %v", err), logAttribute)
			} else {
				webService.Logger.Log(context.TODO(), slog.LevelInfo, fmt.Sprintf("Ping redis server result: %v", redisStatusResult), logAttribute)
			}
		}
	}()

	// Setup router
	router := chi.NewRouter()
	router.Use(httplog.RequestLogger(webService.Logger))
	router.Use(middleware.Heartbeat(intpkgutils.WebServiceBasePath() + "ping"))
	router.Use(cors.Handler(cors.Options{
		AllowedOrigins:   strings.Split(os.Getenv("WEB_SERVICE_CORS_URLS"), " "),
		AllowedMethods:   []string{"GET", "POST", "DELETE", "PUT"},
		AllowedHeaders:   []string{"Accept", "Content-Type"},
		AllowCredentials: true,
	}))
	intwsrouters.InitWebServiceWebsiteRouter(router, webService)
	intwsrouters.InitWebServiceApiCoreRouter(router, webService)

	// Start http server
	webService.Logger.Log(context.TODO(), slog.Level(2), fmt.Sprintf("Server will be listening on port: %v at base path '%v'", os.Getenv("WEB_SERVICE_PORT"), intpkgutils.WebServiceBasePath()), slog.Attr{Key: intpkglog.SectionAttrKey, Value: slog.StringValue("startup")})
	if err := http.ListenAndServe(":"+os.Getenv("WEB_SERVICE_PORT"), router); err != nil {
		webService.Logger.Log(context.TODO(), slog.LevelError, fmt.Sprintf("Could not start server , error: %v", err), slog.Attr{Key: intpkglog.SectionAttrKey, Value: slog.StringValue("startup")})
		os.Exit(1)
	}
}
