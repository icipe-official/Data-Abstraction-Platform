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
	intpkgiam "github.com/icipe-official/Data-Abstraction-Platform/internal/pkg/iam"
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
	webService.Env = make(map[string]string)

	// Verify env variables, setup iam environment, and initialize website manifest.
	func() {
		logAttribute := slog.Attr{Key: intpkglog.SectionAttrKey, Value: slog.StringValue("startup")}

		// Verify env variables
		webService.Logger.Log(context.TODO(), slog.Level(2), "Checking required env variables...", logAttribute)
		if missingEnvVariables := intpkgutils.CheckRequiredEnvVariables([]string{
			"WEB_SERVICE_CORS_URLS",
			"WEB_SERVICE_PORT",
			"WEBSITE_BASE_URL",
			"PSQL_DATABASE_URI",
			"IAM_ENCRYPTION_KEY",
			intpkglib.ENV_WEBSITE_DIRECTORY,
			intpkglib.ENV_OPENID_CLIENT_ID,
			intpkglib.ENV_OPENID_CLIENT_SECRET,
		}); len(missingEnvVariables) > 0 {
			webService.Logger.Log(context.TODO(), slog.LevelError, fmt.Sprintf("Following env variables not set: %+q", missingEnvVariables), logAttribute)
			os.Exit(1)
		}
		webService.Env[intpkglib.ENV_WEB_SERVICE_BASE_PATH] = intpkgutils.WebServiceBasePath()
		webService.Env[intpkglib.ENV_WEBSITE_BASE_URL] = os.Getenv(intpkglib.ENV_WEBSITE_BASE_URL)

		// Setup Iam Environment
		if err := intpkgiam.SetupIamEnvironment(webService, logAttribute); err != nil {
			webService.Logger.Log(context.TODO(), slog.LevelError, fmt.Sprintf("Setup Iam Environment failed, error: %v", err), logAttribute)
			os.Exit(1)
		}

		webService.Env[intpkglib.ENV_WEBSITE_DIRECTORY] = func() string {
			websiteDirectory := os.Getenv(intpkglib.ENV_WEBSITE_DIRECTORY)
			if !strings.HasSuffix(websiteDirectory, "/") {
				websiteDirectory += "/"
			}
			return websiteDirectory
		}()

		webService.Logger.Log(context.TODO(), slog.Level(2), "Setting up paths to html pages...", logAttribute)
		htmlPagesFilePath := fmt.Sprintf("%vhtml_pages.json", webService.Env[intpkglib.ENV_WEBSITE_DIRECTORY])
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
	}()

	// Setup router
	router := chi.NewRouter()
	router.Use(httplog.RequestLogger(webService.Logger))
	router.Use(middleware.Heartbeat(webService.Env[intpkglib.ENV_WEB_SERVICE_BASE_PATH] + "ping"))
	router.Use(cors.Handler(cors.Options{
		AllowedOrigins:   strings.Split(os.Getenv("WEB_SERVICE_CORS_URLS"), " "),
		AllowedMethods:   []string{"GET", "POST", "DELETE", "PUT"},
		AllowedHeaders:   []string{"Accept", "Content-Type"},
		AllowCredentials: true,
	}))
	intwsrouters.InitWebServiceWebsiteRouter(router, webService)
	intwsrouters.InitWebServiceApiCoreRouter(router, webService)

	// Start http server
	webService.Logger.Log(context.TODO(), slog.Level(2), fmt.Sprintf("Server will be listening on port: %v at base path '%v'", os.Getenv("WEB_SERVICE_PORT"), webService.Env[intpkglib.ENV_WEB_SERVICE_BASE_PATH]), slog.Attr{Key: intpkglog.SectionAttrKey, Value: slog.StringValue("startup")})
	if err := http.ListenAndServe(":"+os.Getenv("WEB_SERVICE_PORT"), router); err != nil {
		webService.Logger.Log(context.TODO(), slog.LevelError, fmt.Sprintf("Could not start server , error: %v", err), slog.Attr{Key: intpkglog.SectionAttrKey, Value: slog.StringValue("startup")})
		os.Exit(1)
	}
}
