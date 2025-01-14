// Package json contains functions for manipulating values in their JSON form.
//
// Before function arguments are processed, they are converted to JSON and back into arguments of that map[string]any or []any.
package json

import (
	"encoding/json"
	"errors"
	"fmt"
	"reflect"
	"regexp"
	"strings"
)

// Regular expression to extract object keys and array indexes from path string into an array of strings using built-in string match function.
//
// Example: '8.childobject.array.[2][3].childobject'.match(new RegExp(/[^\.\[\]]+/, 'g')) results in the array ["8","childobject","array","2","3","childobject"]
func _KEY_ARRAY_INDEX_REGEX() *regexp.Regexp {
	return regexp.MustCompile(`[\.\[\]]+`)
}

func GetPathObjectKeyArrayIndexes(path string) []string {
	pathObjectKeyArrayIndexes := make([]string, 0)
	for _, value := range _KEY_ARRAY_INDEX_REGEX().Split(strings.Replace(path, "$.", "", 1), -1) {
		if strings.TrimSpace(value) != "" {
			pathObjectKeyArrayIndexes = append(pathObjectKeyArrayIndexes, value)
		}
	}
	return pathObjectKeyArrayIndexes
}

var ErrValueNotFoundError = fmt.Errorf("ValueNotFound")

// Expects value to a pointer.
func JSONStringifyParse(value any) (any, error) {
	if reflect.TypeOf(value).Kind() != reflect.Pointer {
		return nil, errors.New("argument value is not a pointer")
	}
	if jsonString, err := JSONStringify(value); err != nil {
		return nil, err
	} else {
		if jsonParsed, err := JSONParse(jsonString); err != nil {
			return nil, err
		} else {
			return jsonParsed, nil
		}
	}
}

// Expects value to a pointer.
func JSONStringify(value any) (string, error) {
	if reflect.TypeOf(value).Kind() != reflect.Pointer {
		return "", errors.New("argument value is not a pointer")
	}
	if json, err := json.Marshal(value); err != nil {
		return "", err
	} else {
		return string(json), nil
	}
}

// Expects value to a pointer.
func JSONStringifyNoError(value any) any {
	if json, err := json.Marshal(value); err != nil {
		return value
	} else {
		return string(json)
	}
}

func JSONParse(value string) (any, error) {
	var parsedValue any
	if err := json.Unmarshal([]byte(value), &parsedValue); err != nil {
		return nil, err
	} else {
		return parsedValue, nil
	}
}
