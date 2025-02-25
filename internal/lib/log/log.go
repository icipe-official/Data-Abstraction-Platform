package log

import (
	"fmt"
	"log/slog"
	"os"
	"strconv"
	"time"

	"github.com/go-chi/httplog/v2"
)

const SectionAttrKey string = "section"

func GetLogServiceName(serviceSubName string) string {
	lsn := os.Getenv("LOG_SERVICE_BASE_NAME")
	if lsn == "" {
		return fmt.Sprintf("%v-%v", "rahab-platform", serviceSubName)
	} else {
		return fmt.Sprintf("%v-%v", lsn, serviceSubName)
	}
}

func GetLogOptionBool(envName string) bool {
	envValue := os.Getenv(envName)
	if envValue == "true" {
		return true
	} else {
		return false
	}
}

func GetLogLevel() int {
	if lv, err := strconv.Atoi(os.Getenv("LOG_LEVEL")); err != nil {
		return 0
	} else {
		return lv
	}
}

func NewHttpLogger() *httplog.Logger {
	return httplog.NewLogger(GetLogServiceName("web-service"), httplog.Options{
		JSON:             GetLogOptionBool("LOG_USE_JSON"),
		LogLevel:         slog.Level(GetLogLevel()),
		Concise:          GetLogOptionBool("LOG_COINCISE"),
		RequestHeaders:   GetLogOptionBool("LOG_REQUEST_HEADERS"),
		MessageFieldName: "message",
		TimeFieldFormat:  time.RFC3339,
		Tags: map[string]string{
			"version": os.Getenv("LOG_APP_VERSION"),
		},
	})
}
