package json

import (
	"reflect"
	"strconv"
)

type forEachValInObj struct {
	ifValueFoundInObject func(currentValuePathKeyArrayIndexes []any, valueFound any) bool
}

// Calls ifValueFoundInObject if a value is found at path.
//
// Returns error if conversion of object to json and back fails.
func ForEachValueInObject(object any, path string, ifValueFoundInObject func(currentValuePathKeyArrayIndexes []any, valueFound any) bool) (bool, error) {
	n := forEachValInObj{
		ifValueFoundInObject: ifValueFoundInObject,
	}

	objectJson, err := JSONStringifyParse(object)
	if err != nil {
		return false, err
	}

	if len(path) == 0 || path == "$" {
		return ifValueFoundInObject([]any{"$"}, objectJson), nil
	} else {
		return n.forEachValueInObject(objectJson, GetPathObjectKeyArrayIndexes(path), []any{"$"}), nil
	}
}

func (n *forEachValInObj) forEachValueInObject(currentValue any, pathObjectKeyArrayIndexes []string, currentValuePathKeyArrayIndexes []any) bool {
	if currentValue == nil || (reflect.TypeOf(currentValue).Kind() != reflect.Map && reflect.TypeOf(currentValue).Kind() != reflect.Slice) {
		return true
	}

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
		if currentPathKeyArrayIndex.(string) == "*" {
			switch reflect.TypeOf(currentValue).Kind() {
			case reflect.Map:
				for key, value := range currentValue.(map[string]any) {
					if len(pathObjectKeyArrayIndexes) > 0 {
						if n.forEachValueInObject(value, pathObjectKeyArrayIndexes, append(currentValuePathKeyArrayIndexes, key)) {
							return true
						}
					} else {
						if n.ifValueFoundInObject(append(currentValuePathKeyArrayIndexes, key), value) {
							return true
						}
					}
				}
			case reflect.Slice:
				for index, value := range currentValue.([]any) {
					if len(pathObjectKeyArrayIndexes) > 0 {
						if n.forEachValueInObject(value, pathObjectKeyArrayIndexes, append(currentValuePathKeyArrayIndexes, index)) {
							return true
						}
					} else {
						if n.ifValueFoundInObject(append(currentValuePathKeyArrayIndexes, index), value) {
							return true
						}

					}
				}
			}
		} else {
			if reflect.TypeOf(currentValue).Kind() == reflect.Map {
				if valueFound, ok := currentValue.(map[string]any)[currentPathKeyArrayIndex.(string)]; ok {
					if len(pathObjectKeyArrayIndexes) > 0 {
						n.forEachValueInObject(valueFound, pathObjectKeyArrayIndexes, append(currentValuePathKeyArrayIndexes, currentPathKeyArrayIndex))
					} else {
						n.ifValueFoundInObject(append(currentValuePathKeyArrayIndexes, currentPathKeyArrayIndex), valueFound)
					}

				}
			}
		}
	case reflect.Int:
		if reflect.TypeOf(currentValue).Kind() == reflect.Slice && currentPathKeyArrayIndex.(int) < len(currentValue.([]any)) {
			if len(pathObjectKeyArrayIndexes) > 0 {
				n.forEachValueInObject(currentValue.([]any)[currentPathKeyArrayIndex.(int)], pathObjectKeyArrayIndexes, append(currentValuePathKeyArrayIndexes, currentPathKeyArrayIndex))
			} else {
				n.ifValueFoundInObject(append(currentValuePathKeyArrayIndexes, currentPathKeyArrayIndex), currentValue.([]any)[currentPathKeyArrayIndex.(int)])
			}
		}
	}

	return true
}
