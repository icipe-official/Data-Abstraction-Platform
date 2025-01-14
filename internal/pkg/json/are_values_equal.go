package json

import (
	"reflect"
)

// Performs a deep check to see if two values are equal.
//
// Checks the following:
//
//  1. The data type of each value.
//
//  2. Number of elements or keys in an array and map respectively.
//
// Expects passed values to be pointers.
func AreValuesEqual(valueOne any, valueTwo any) (bool, error) {
	valueOneJson, err := JSONStringifyParse(valueOne)
	if err != nil {
		return false, err
	}

	valueTwoJson, err := JSONStringifyParse(valueTwo)
	if err != nil {
		return false, err
	}

	return areValuesEqual(valueOneJson, valueTwoJson), nil
}

func areValuesEqual(currentValueOne any, currentValueTwo any) bool {
	if currentValueOne == nil || currentValueTwo == nil {
		return currentValueOne == currentValueTwo
	}

	if reflect.TypeOf(currentValueOne).Kind() != reflect.TypeOf(currentValueTwo).Kind() {
		return false
	}

	switch reflect.TypeOf(currentValueOne).Kind() {
	case reflect.Map:
		valueOneKeys := make([]string, 0)
		for key := range currentValueOne.(map[string]any) {
			valueOneKeys = append(valueOneKeys, key)
		}
		valueTwoKeys := make([]string, 0)
		for key := range currentValueTwo.(map[string]any) {
			valueTwoKeys = append(valueTwoKeys, key)
		}

		if len(valueOneKeys) != len(valueTwoKeys) {
			return false
		}

		for _, keyOne := range valueOneKeys {
			keyOneMatchesKeyTwo := false
			for _, keyTwo := range valueTwoKeys {
				if keyOne == keyTwo {
					keyOneMatchesKeyTwo = true
					if !areValuesEqual(currentValueOne.(map[string]any)[keyOne], currentValueTwo.(map[string]any)[keyTwo]) {
						return false
					}
					break
				}
			}
			if !keyOneMatchesKeyTwo {
				return false
			}
		}
		return true
	case reflect.Slice:
		if len(currentValueOne.([]any)) != len(currentValueTwo.([]any)) {
			return false
		}
		for cvoIndex, cvovalue := range currentValueOne.([]any) {
			if !areValuesEqual(cvovalue, currentValueTwo.([]any)[cvoIndex]) {
				return false
			}
		}
		return true
	default:
		return currentValueOne == currentValueTwo
	}
}
