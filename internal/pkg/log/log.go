package log

import (
	"fmt"
	"os"
	"strconv"
)

const SectionAttrKey string = "section"

func GetLogServiceName(serviceSubName string) string {
	lsn := os.Getenv("LOG_SERVICE_BASE_NAME")
	if lsn == "" {
		return fmt.Sprintf("%v-%v", "data-abstraction-platform", serviceSubName)
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
