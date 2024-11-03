package utils

import (
	"bytes"
	"encoding/gob"
	"encoding/json"
	"fmt"
	"math/rand"
	"net/http"
	"os"
	"reflect"
	"regexp"
	"runtime"
	"strconv"
	"strings"
)

func AnyToBytes(data any) ([]byte, error) {
	var buf bytes.Buffer
	enc := gob.NewEncoder(&buf)
	if err := enc.Encode(data); err != nil {
		return nil, err
	}
	return buf.Bytes(), nil
}

const HTTP_ERROR_SPLIT string = "->"

func GenMetadataModelJoinKey(prefix string, suffix string) string {
	return fmt.Sprintf("%s_join_%s", prefix, suffix)
}

func GetMetadataModelJsonFile(tableName string) string {
	return fmt.Sprintf("%s.metadata_model.json", tableName)
}

func PostgresGetandUpdateNextPlaceholder(nextPlaceholder *int) string {
	defer func() {
		*nextPlaceholder += 1
	}()
	return fmt.Sprintf("$%d", *nextPlaceholder)
}

func PostgresGetUpdateSetColumns(colums []string, nextPlaceholder *int) string {
	setColumns := make([]string, 0)
	for _, value := range colums {
		setColumns = append(setColumns, fmt.Sprintf("%s = $%d", value, *nextPlaceholder))
		*nextPlaceholder += 1
	}
	return strings.Join(setColumns, ", ")
}

func PostgresGetQueryPlaceholderString(noOfPlaceHolders int, nextPlaceholder *int) string {
	placeholders := make([]string, 0)
	for i := 0; i < noOfPlaceHolders; i++ {
		placeholders = append(placeholders, fmt.Sprintf("$%d", *nextPlaceholder))
		*nextPlaceholder += 1
	}
	return strings.Join(placeholders, ", ")
}

func EmailValidationRegex() *regexp.Regexp {
	return regexp.MustCompile(`^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$`)
}

func GetFunctionNameAndErrorMessage(funcName any, message string) error {
	return fmt.Errorf("%v: %v", GetFunctionName(funcName), message)
}

func GetFunctionName(i any) string {
	return runtime.FuncForPC(reflect.ValueOf(i).Pointer()).Name()
}

func GenRandomString(length int, includeSpecialSymbols bool) string {
	stringPool := []rune("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789")
	if includeSpecialSymbols {
		stringPool = append(stringPool, []rune("_~-")...)
	}
	randomString := make([]rune, length)
	for index := range randomString {
		randomString[index] = stringPool[rand.Intn(len(stringPool))]
	}
	return string(randomString)
}

func NewError(code int, message string) error {
	return fmt.Errorf("%v%v%v", code, HTTP_ERROR_SPLIT, message)
}

func SendJsonResponse(httpStatusCode int, data any, w http.ResponseWriter) {
	if json, err := json.Marshal(data); err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("Process JSON response failed"))
	} else {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(httpStatusCode)
		w.Write(json)
	}
}

func SendJsonErrorResponse(errorResponse error, w http.ResponseWriter) {
	httpStatusCode, httpStatusMessage := SplitJsonErrorResponse(errorResponse)
	SendJsonResponse(httpStatusCode, struct {
		Message string `json:"message"`
	}{Message: httpStatusMessage}, w)
}

func SplitJsonErrorResponse(errorResponse error) (int, string) {
	newError := strings.Split(errorResponse.Error(), HTTP_ERROR_SPLIT)
	if httpStatusCode, err := strconv.Atoi(newError[0]); err == nil {
		return httpStatusCode, newError[1]
	}
	return 500, errorResponse.Error()
}

func CheckRequiredEnvVariables(envVars []string) []string {
	envVariablesMissing := make([]string, 0)
	for _, ev := range envVars {
		if os.Getenv(ev) == "" {
			envVariablesMissing = append(envVariablesMissing, ev)
		}
	}

	return envVariablesMissing
}

func VerifyIamKeys() error {
	iekLength := len(os.Getenv("IAM_ENCRYPTION_KEY"))
	if iekLength != 16 && iekLength != 24 && iekLength != 32 {
		return fmt.Errorf("env variable IAM_ENCRYPTION_KEY can only be 16, 24, or 32 characters in length ONLY")
	}
	iarkLength := len(os.Getenv("IAM_ACCESS_REFRESH_TOKEN"))
	if iarkLength > 36 {
		return fmt.Errorf("env variable IAM_ACCESS_REFRESH_TOKEN can have a maximum character length of 36 ONLY")
	}
	return nil
}

func WebServiceAppPrefix() string {
	appPrefix := os.Getenv("WEB_SERVICE_APP_PREFIX")
	if len(appPrefix) == 0 {
		return "rahab_platform"
	}
	return appPrefix
}

func WebServiceBasePath() string {
	basePath := os.Getenv("WEB_SERVICE_BASE_PATH")
	if !strings.HasSuffix(basePath, "/") {
		basePath += "/"
	}
	return basePath
}

func PsqlGetFullTextSearchQuery(fullTextSearchColumn string, searchQuery string) string {
	sqSplitSpace := strings.Split(searchQuery, " ")
	if len(sqSplitSpace) > 0 {
		newQuery := fmt.Sprintf("%v @@ to_tsquery('%v:*')", fullTextSearchColumn, sqSplitSpace[0])
		for i := 1; i < len(sqSplitSpace); i++ {
			newQuery = newQuery + " AND " + fmt.Sprintf("%v @@ to_tsquery('%v:*')", fullTextSearchColumn, sqSplitSpace[i])
		}
		return newQuery
	} else {
		return fmt.Sprintf("%v @@ to_tsquery('%v:*')", fullTextSearchColumn, searchQuery)
	}
}
