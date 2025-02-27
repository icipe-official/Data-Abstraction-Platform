package lib

import (
	"fmt"
	"log/slog"
	"os"
	"strconv"
	"time"

	"github.com/go-chi/httplog/v2"
)

const LogSectionAttrKey string = "section"

func LogGetServiceName(serviceSubName string) string {
	lsn := os.Getenv("LOG_SERVICE_BASE_NAME")
	if lsn == "" {
		return fmt.Sprintf("%v-%v", "rahab-platform", serviceSubName)
	} else {
		return fmt.Sprintf("%v-%v", lsn, serviceSubName)
	}
}

func LogGetOptionBool(envName string) bool {
	envValue := os.Getenv(envName)
	if envValue == "true" {
		return true
	} else {
		return false
	}
}

func LogGetLevel() int {
	if lv, err := strconv.Atoi(os.Getenv("LOG_LEVEL")); err != nil {
		return 0
	} else {
		return lv
	}
}

func LogNewHttpLogger() *httplog.Logger {
	return httplog.NewLogger(LogGetServiceName("web-service"), httplog.Options{
		JSON:             LogGetOptionBool("LOG_USE_JSON"),
		LogLevel:         slog.Level(LogGetLevel()),
		Concise:          LogGetOptionBool("LOG_COINCISE"),
		RequestHeaders:   LogGetOptionBool("LOG_REQUEST_HEADERS"),
		MessageFieldName: "message",
		TimeFieldFormat:  time.RFC3339,
		Tags: map[string]string{
			"version": os.Getenv("LOG_APP_VERSION"),
		},
	})
}
