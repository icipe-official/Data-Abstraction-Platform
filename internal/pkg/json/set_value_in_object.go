package json

import (
	"reflect"
	"strconv"
)

// Add or replace value in object with ValueToSet following the path.
//
// Parameters:
//
//   - object - Object or array to modify through addition of valueToSet. Will be converted to JSON and back.
//
//   - valueToSet - value to be added to object.
//
//   - path - Object-like path to where to place valueToSet.
//
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
// Returns object with valueToSet added to it or an error if converting object and valueToSet to JSON and back fails.
func SetValueInObject(object any, path string, valueToSet any) (any, error) {
	var valueToSetJson any

	var setValueInObject func(currentValue any, pathObjectKeyArrayIndexes []string) any
	setValueInObject = func(currentValue any, pathObjectKeyArrayIndexes []string) any {
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
			if currentValue == nil || reflect.TypeOf(currentValue).Kind() != reflect.Map {
				currentValue = map[string]any{}
			}
			if len(pathObjectKeyArrayIndexes) > 0 {
				currentValue.(map[string]any)[currentPathKeyArrayIndex.(string)] = setValueInObject(currentValue.(map[string]any)[currentPathKeyArrayIndex.(string)], pathObjectKeyArrayIndexes)
			} else {
				currentValue.(map[string]any)[currentPathKeyArrayIndex.(string)] = valueToSetJson
			}
		case reflect.Int:
			if currentValue == nil || reflect.TypeOf(currentValue).Kind() != reflect.Slice {
				currentValue = []any{}
			}
			if currentPathKeyArrayIndex.(int) > len(currentValue.([]any))-1 {
				for i := len(currentValue.([]any)); i <= currentPathKeyArrayIndex.(int); i++ {
					currentValue = append(currentValue.([]any), nil)
				}
			}
			if len(pathObjectKeyArrayIndexes) > 0 {
				currentValue.([]any)[currentPathKeyArrayIndex.(int)] = setValueInObject(currentValue.([]any)[currentPathKeyArrayIndex.(int)], pathObjectKeyArrayIndexes)
			} else {
				currentValue.([]any)[currentPathKeyArrayIndex.(int)] = valueToSetJson
			}
		default:
			return currentValue
		}

		return currentValue
	}

	objectJson, err := JSONStringifyParse(object)
	if err != nil {
		return nil, err
	}

	valueToSetJson, err = JSONStringifyParse(&valueToSet)
	if err != nil {
		return nil, err
	}

	if len(path) == 0 || path == "$" {
		if valueToSetJson, err := JSONStringifyParse(&valueToSet); err != nil {
			return nil, err
		} else {
			return valueToSetJson, nil
		}
	} else {
		return setValueInObject(objectJson, GetPathObjectKeyArrayIndexes(path)), nil
	}
}
