package json

import (
	"fmt"
	"reflect"
	"strconv"
)

// Get value in object found at path.
//
// Parameters:
//
//   - object - Object or array from which to get the value from.
//
//   - path - Object-like path to value to get from object.
//
//     Numbers enclosed in square brackets or between full-stops typically indicate array indexes though it depends on the type of value encountered.
//
//     If path is empty, or equals to '$' then the object itself will be returned.
//
//     If path begins with `$.`, then it is removed. Intention is to match Postgres' json path syntax.
//
//     Examples:
//
//   - `$.[8].childobject.array[2][3].childobject`.
//
//   - `$.8.childobject.array.2.3.childobject`.
//
// Returns value found in object or and error in the following instances:
//   - Value not found in object "ValueNotFound"
//   - Converting object to JSON and back fails.
func GetValueInObject(object any, path string) (any, error) {
	objectJson, err := JSONStringifyParse(object)
	if err != nil {
		return nil, err
	}

	if len(path) == 0 || path == "$" {
		return objectJson, nil
	} else {
		return getValueInObject(objectJson, GetPathObjectKeyArrayIndexes(path))
	}
}

func getValueInObject(currentValue any, pathObjectKeyArrayIndexes []string) (any, error) {
	if currentValue == nil || (reflect.TypeOf(currentValue).Kind() != reflect.Map && reflect.TypeOf(currentValue).Kind() != reflect.Slice) {
		return nil, ErrValueNotFoundError
	}
	typeOfCurrentValue := reflect.TypeOf(currentValue).Kind()

	currentPathKeyArrayIndex := func() any {
		if arrayIndex, err := strconv.Atoi(pathObjectKeyArrayIndexes[0]); err != nil {
			return pathObjectKeyArrayIndexes[0]
		} else {
			return arrayIndex
		}
	}()
	pathObjectKeyArrayIndexes = pathObjectKeyArrayIndexes[1:]

	switch reflect.TypeOf(currentPathKeyArrayIndex).Kind() {
	case reflect.String:
		return getValueInMap(currentValue, currentPathKeyArrayIndex, pathObjectKeyArrayIndexes)
	case reflect.Int:
		if typeOfCurrentValue == reflect.Slice {
			if currentPathKeyArrayIndex.(int) < len(currentValue.([]any)) {
				if len(pathObjectKeyArrayIndexes) > 0 {
					return getValueInObject(currentValue.([]any)[currentPathKeyArrayIndex.(int)], pathObjectKeyArrayIndexes)
				}
				return currentValue.([]any)[currentPathKeyArrayIndex.(int)], nil

			}
		} else {
			return getValueInMap(currentValue, currentPathKeyArrayIndex, pathObjectKeyArrayIndexes)
		}
	}
	return nil, ErrValueNotFoundError
}

func getValueInMap(currentValue any, currentPathKeyArrayIndex any, pathObjectKeyArrayIndexes []string) (any, error) {
	if reflect.TypeOf(currentValue).Kind() == reflect.Map {
		if value, ok := currentValue.(map[string]any)[fmt.Sprintf("%v", currentPathKeyArrayIndex)]; ok {
			if len(pathObjectKeyArrayIndexes) > 0 {
				return getValueInObject(value, pathObjectKeyArrayIndexes)
			}
			return value, nil
		}
	}
	return nil, ErrValueNotFoundError
}
