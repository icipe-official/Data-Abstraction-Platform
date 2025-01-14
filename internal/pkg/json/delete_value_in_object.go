package json

import (
	"fmt"
	"reflect"
	"strconv"
)

// Delete value found at path in object.
//
// Parameters:
//
//   - object - Object or array to modify through deletion. Expects object to be a pointer.
//
//   - path - Object-like path to value to remove from object.
//     Numbers enclosed in square brackets or between full-stops indicate array indexes.
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
// Returns object with value found at path deleted to it or an error in the following instances:
//   - Value not found in object "ValueNotFound"
//   - Converting object and valueToSet to JSON and back fails.
func DeleteValueInObject(object any, path string) (any, error) {
	var objectJson any

	objectJson, err := JSONStringifyParse(object)
	if err != nil {
		return nil, err
	}

	if len(path) == 0 || path == "$" {
		switch reflect.TypeOf(objectJson).Kind() {
		case reflect.Map:
			return map[string]any{}, nil
		case reflect.Slice:
			return []any{}, nil
		default:
			return nil, nil
		}
	} else {
		return deleteValueInObject(objectJson, GetPathObjectKeyArrayIndexes(path))
	}
}

func deleteValueInObject(currentValue any, pathObjectKeyArrayIndexes []string) (any, error) {
	if currentValue == nil || (reflect.TypeOf(currentValue).Kind() != reflect.Map && reflect.TypeOf(currentValue).Kind() != reflect.Slice) {
		return currentValue, ErrValueNotFoundError
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
		return deleteValueInMap(currentValue, currentPathKeyArrayIndex, pathObjectKeyArrayIndexes)
	case reflect.Int:
		if typeOfCurrentValue == reflect.Slice {
			if currentPathKeyArrayIndex.(int) > len(currentValue.([]any)) {
				return currentValue, ErrValueNotFoundError
			}
			if len(pathObjectKeyArrayIndexes) > 0 {
				var err error
				currentValue.([]any)[currentPathKeyArrayIndex.(int)], err = deleteValueInObject(currentValue.([]any)[currentPathKeyArrayIndex.(int)], pathObjectKeyArrayIndexes)
				if err != nil {
					return currentValue, err
				}
			} else {
				currentValue = append(currentValue.([]any)[:currentPathKeyArrayIndex.(int)], currentValue.([]any)[currentPathKeyArrayIndex.(int)+1:]...)
			}
		} else {
			return deleteValueInMap(currentValue, currentPathKeyArrayIndex, pathObjectKeyArrayIndexes)
		}
	}

	return currentValue, nil
}

func deleteValueInMap(currentValue any, currentPathKeyArrayIndex any, pathObjectKeyArrayIndexes []string) (any, error) {
	if reflect.TypeOf(currentValue).Kind() == reflect.Map {
		if value, ok := currentValue.(map[string]any)[fmt.Sprintf("%v", currentPathKeyArrayIndex)]; ok {
			if len(pathObjectKeyArrayIndexes) > 0 {
				var err error
				currentValue.(map[string]any)[fmt.Sprintf("%v", currentPathKeyArrayIndex)], err = deleteValueInObject(value, pathObjectKeyArrayIndexes)
				if err != nil {
					return currentValue, err
				}
			} else {
				delete(currentValue.(map[string]any), fmt.Sprintf("%v", currentPathKeyArrayIndex))
			}
			return currentValue, nil
		}
	}
	return currentValue, ErrValueNotFoundError
}
