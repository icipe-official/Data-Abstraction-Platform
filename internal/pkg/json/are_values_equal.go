package json

import (
	"reflect"
)

// Performs a deep check to see if two values are equal.
//
// Particulary useful for nested objects and arrays.
//
// Expects arguments to be presented as if converted from JSON.
//
// Checks the following:
//
//  1. The data type of each value.
//
//  2. Number of elements in an array and keys-values in a map.
func AreValuesEqual(valueOne any, valueTwo any) bool {
	if reflect.TypeOf(valueOne).Kind() != reflect.TypeOf(valueTwo).Kind() {
		return false
	}

	switch reflect.TypeOf(valueOne).Kind() {
	case reflect.Map:
		valueOneKeys := make([]string, 0)
		for key := range valueOne.(map[string]any) {
			valueOneKeys = append(valueOneKeys, key)
		}
		valueTwoKeys := make([]string, 0)
		for key := range valueTwo.(map[string]any) {
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
					if !AreValuesEqual(valueOne.(map[string]any)[keyOne], valueTwo.(map[string]any)[keyTwo]) {
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
		if len(valueOne.([]any)) != len(valueTwo.([]any)) {
			return false
		}
		for cvoIndex, cvovalue := range valueOne.([]any) {
			if !AreValuesEqual(cvovalue, valueTwo.([]any)[cvoIndex]) {
				return false
			}
		}
		return true
	default:
		return valueOne == valueTwo
	}
}
