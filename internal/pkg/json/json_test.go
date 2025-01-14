package json

import (
	"fmt"
	"reflect"
	"strings"
	"testing"
)

func TestGetPathObjectKeyArrayIndexes(t *testing.T) {
	testData := []struct {
		path                string
		expectedPathIndexes []string
	}{
		{path: "child.1.nectar.willy.15.oxford", expectedPathIndexes: []string{"child", "1", "nectar", "willy", "15", "oxford"}},
		{path: "child.1.nectar.willy.15.oxford", expectedPathIndexes: []string{"child", "1", "nectar", "willy", "15", "oxford"}},
		{path: "$.child[1].nectar.willy.[5][3]", expectedPathIndexes: []string{"child", "1", "nectar", "willy", "5", "3"}},
		{path: "child.4", expectedPathIndexes: []string{"child", "4"}},
		{path: "child.1.nectar.willy.15.bee[3]", expectedPathIndexes: []string{"child", "1", "nectar", "willy", "15", "bee", "3"}},
		{path: "$.child.1.nectar.two", expectedPathIndexes: []string{"child", "1", "nectar", "two"}},
		{path: "$.child.1.nectar.mocha", expectedPathIndexes: []string{"child", "1", "nectar", "mocha"}},
		{path: "$.child.1.nectar[4][5][6].sofa", expectedPathIndexes: []string{"child", "1", "nectar", "4", "5", "6", "sofa"}},
		{path: "[2]child.nectar", expectedPathIndexes: []string{"2", "child", "nectar"}},
		{path: "[ ].child..nectar", expectedPathIndexes: []string{"child", "nectar"}},
		{path: "  .willy.  [  ].sofa", expectedPathIndexes: []string{"willy", "sofa"}},
	}

	for _, value := range testData {
		pathIndexes := GetPathObjectKeyArrayIndexes(value.path)
		if len(pathIndexes) != len(value.expectedPathIndexes) {
			t.Errorf(
				"\nFAILED, Expected length of generated pathObjectKeyArrayIndexes to be %v, got %v\npath: %v\nGenerated pathObjectKeyArrayIndexes: %v\nExpected pathObjectKeyArrayIndexes: %v",
				len(value.expectedPathIndexes),
				len(pathIndexes),
				value.path,
				strings.Join(pathIndexes, "->"),
				strings.Join(value.expectedPathIndexes, "->"),
			)
		}
		for i := 0; i < len(value.expectedPathIndexes); i++ {
			if pathIndexes[i] != value.expectedPathIndexes[i] {
				t.Errorf(
					"\nFAILED, pathObjectKeyArrayIndex %v is not equal to %v at index %v\npath: %v\nGenerated pathObjectKeyArrayIndexes: %v\nExpected pathObjectKeyArrayIndexes: %v",
					pathIndexes[i],
					value.expectedPathIndexes[i],
					i,
					value.path,
					strings.Join(pathIndexes, "->"),
					strings.Join(value.expectedPathIndexes, "->"),
				)
			}
		}
	}
}

func TestGetSetDeleteValueInObject(t *testing.T) {
	var originalObject any = map[string]any{
		"child": []any{
			nil,
			map[string]any{
				"nectar": map[string]any{
					"willy": []any{
						nil, nil, nil, nil, nil, []any{nil, nil, nil, "smitty"}, nil, nil, nil, nil, nil, nil, nil, nil, nil,
						map[string]any{
							"oxford": "willow",
							"bee":    []any{nil, nil, nil, 5},
						},
					},
					"two": []any{1, 2, 3, 4, 5},
				},
				"mocha": struct {
					Nacho  string
					Amount float64
				}{
					Nacho:  "cheese",
					Amount: 45.56,
				},
			},
			nil,
			nil,
			"another child",
		},
	}

	var testObject any = nil

	setValueTestData := [][]any{
		{"child.1.nectar.willy.15.oxford", "willow"},
		{"$.child[1].nectar.willy.[5][3]", "smitty"},
		{"child.4", "another child"},
		{"child.1.nectar.willy.15.bee[3]", 5},
		{"$.child.1.nectar.two", []any{1, 2, 3, 4, 5}},
		{"$.child.1.mocha", struct {
			Nacho  string
			Amount float64
		}{
			Nacho:  "cheese",
			Amount: 45.56,
		}},
	}

	var err error
	for _, value := range setValueTestData {
		valueToModify := testObject
		testObject, err = SetValueInObject(&valueToModify, value[0].(string), value[1])
		if err != nil {
			t.Errorf(
				"\nFAILED, set at path %v failed, error: %v\nvalueToSet: %+v\ntestObject: %+v",
				value[0],
				err,
				value[1],
				testObject,
			)
		}
	}

	if reflect.TypeOf(testObject).Kind() != reflect.Map {
		t.Fatalf(
			"\nFAILED, set setValueTestData in test_object, testObject is not of type `map`\ntestObject reflection type: %v\ntestObject: %+v",
			reflect.TypeOf(testObject).Kind(),
			testObject,
		)
	}

	if originalObjectJson, err := JSONStringifyParse(&originalObject); err != nil {
		t.Fatalf(
			"\nFAILED, JSONStringifyParse originalObject failed, error: %v\noriginalObject: %+v",
			err,
			originalObject,
		)
	} else {
		if !reflect.DeepEqual(originalObjectJson, testObject) {
			t.Fatalf(
				"\nFAILED, set value in object failed, testObject is not equal to originalObjectJson\ntestObject: %+v\noriginalObjectJson: %+v",
				testObject,
				originalObjectJson,
			)
		}
		t.Logf("\nSUCCESS, test set value in test_object successful\ntestObject: %+v\noriginalObjectJson: %+v", testObject, originalObjectJson)
	}

	var path = "$.child[1].nectar.willy[15].oxford"
	if value, err := GetValueInObject(&testObject, path); err != nil {
		t.Errorf("\nFAILED, get value at path %v failed, error: %v\ntestObject:%+v", path, err, testObject)
	} else {
		if reflect.TypeOf(value).Kind() != reflect.String || value != "willow" {
			t.Errorf("\nFAILED, expected value at path %+v to be 'willow', got %v", path, value)
		}
	}

	path = "child[1].nectar.willy[14].oxford"
	if value, err := GetValueInObject(&testObject, path); err != nil {
		if err.Error() != ErrValueNotFoundError.Error() {
			t.Errorf("\nFAILED, expected get value at %v to return error '%v'\ntestObject:%+v", path, ErrValueNotFoundError, testObject)
		}
	} else {
		t.Errorf("\nFAILED, expected value at %v to not exist, got %v\ntestObject:%+v", path, value, testObject)
	}

	path = "child.1.nectar.willy.10"
	if value, err := GetValueInObject(&testObject, path); err != nil {
		t.Errorf("\nFAILED, get value at path %v failed, error: %v\ntestObject:%+v", path, err, testObject)
	} else {
		if value != nil {
			t.Errorf("\nFAILED, expected value at %v to not be nil, got %v\ntestObject:%+v", path, value, testObject)
		}
	}

	path = "$.child"
	if value, err := GetValueInObject(&testObject, path); err != nil {
		t.Errorf("\nFAILED, get value at path %v failed, error: %v\ntestObject:%+v", path, err, testObject)
	} else {
		typeOfValue := reflect.TypeOf(value).Kind()
		if typeOfValue != reflect.Slice {
			t.Errorf("\nFAILED, expected value at %v to not be a slice, got %v\nvalue:%+vtestObject:%+v", path, typeOfValue, value, testObject)
		}
	}

	path = "$.child[1]"
	if value, err := GetValueInObject(&testObject, path); err != nil {
		t.Errorf("\nFAILED, get value at path %v failed, error: %v\ntestObject:%+v", path, err, testObject)
	} else {
		typeOfValue := reflect.TypeOf(value).Kind()
		if typeOfValue != reflect.Map {
			t.Errorf("\nFAILED, expected value at %v to not be a map, got %v\nvalue:%+vtestObject:%+v", path, typeOfValue, value, testObject)
		}
	}

	path = "child.1.nectar.willy"
	if value, err := GetValueInObject(&testObject, path); err != nil {
		t.Errorf("\nFAILED, get value at path %v failed, error: %v\ntestObject:%+v", path, err, testObject)
	} else {
		typeOfValue := reflect.TypeOf(value).Kind()
		if typeOfValue != reflect.Slice {
			t.Errorf("\nFAILED, expected value at %v to not be a slice, got %v\nvalue:%+vtestObject:%+v", path, typeOfValue, value, testObject)
		} else {
			valueLength := len(value.([]any))
			if valueLength != 16 {
				t.Errorf("\nFAILED, expected length of slice value at %v to not be 16, got %v\ntestObject:%+v", path, value, valueLength)
			}
		}
	}

	path = "$.child[1].nectar.willy[13]"
	testObject, err = DeleteValueInObject(&testObject, path)
	if err != nil {
		t.Errorf("\nFAILED, delete value at path %v failed, error: %v\ntestObject:%+v", path, err, testObject)
	} else {
		if value, err := GetValueInObject(&testObject, "$.child[1].nectar.willy"); err != nil {
			t.Errorf("\nFAILED, get array value at path '$.child[1].nectar.willy' after delete %v failed, error: %v\ntestObject:%+v", path, err, testObject)
		} else {
			typeOfValue := reflect.TypeOf(value).Kind()
			if typeOfValue != reflect.Slice {
				t.Errorf("\nFAILED, after delete expected value at %v to not be a slice, got %v\nvalue:%+vtestObject:%+v", path, typeOfValue, value, testObject)
			} else {
				valueLength := len(value.([]any))
				if valueLength != 15 {
					t.Errorf("\nFAILED, after delete expected length of slice value at %v to not be 15, got %v\ntestObject:%+v", path, value, valueLength)
				}
			}
		}
	}

	path = "$.child.1.mocha.Amount"
	testObject, err = DeleteValueInObject(&testObject, path)
	if err != nil {
		t.Errorf("\nFAILED, delete value at path %v failed, error: %v\ntestObject:%+v", path, err, testObject)
	} else {
		if value, err := GetValueInObject(&testObject, "$.child.1.mocha"); err != nil {
			t.Errorf("\nFAILED, get array value at path '$.child[1].nectar.willy' after delete %v failed, error: %v\ntestObject:%+v", path, err, testObject)
		} else {
			typeOfValue := reflect.TypeOf(value).Kind()
			if typeOfValue != reflect.Map {
				t.Errorf("\nFAILED, after delete expected value at %v to not be a map, got %v\nvalue:%+vtestObject:%+v", path, typeOfValue, value, testObject)
			} else {
				if value, err := GetValueInObject(&testObject, path); err != nil {
					if err.Error() != ErrValueNotFoundError.Error() {
						t.Errorf("\nFAILED, expected get value after delete at %v to return error '%v'\ntestObject:%+v", path, ErrValueNotFoundError, testObject)
					}
				} else {
					t.Errorf("\nFAILED, expected value after delete at %v to not exist, got %v\ntestObject:%+v", path, value, testObject)
				}
			}
		}
	}

	testObject, err = DeleteValueInObject(&testObject, path)
	if err != nil {
		if err.Error() != ErrValueNotFoundError.Error() {
			t.Errorf("\nFAILED, expected delete value at %v to return error '%v'\ntestObject:%+v", path, ErrValueNotFoundError, testObject)
		}
	}

	path = "$.child[1].nectar.willy[100]"
	testObject, err = DeleteValueInObject(&testObject, path)
	if err != nil {
		if err.Error() != ErrValueNotFoundError.Error() {
			t.Errorf("\nFAILED, expected delete value at %v to return error '%v'\ntestObject:%+v", path, ErrValueNotFoundError, testObject)
		}
	}

	path = "$.child[20].nectar.willy[1]"
	testObject, err = DeleteValueInObject(&testObject, path)
	if err != nil {
		if err.Error() != ErrValueNotFoundError.Error() {
			t.Errorf("\nFAILED, expected delete value at %v to return error '%v'\ntestObject:%+v", path, ErrValueNotFoundError, testObject)
		}
	}
}

func TestAreValuesEqual(t *testing.T) {
	var valueOne any = nil
	var valueTwo any = nil

	if equal, err := AreValuesEqual(&valueOne, &valueTwo); err != nil {
		t.Errorf("\nFAILED, test AreValuesEqual failed, error: %v\nvalueOne:%+v\nvalueTwo:%+v", err, valueOne, valueTwo)
	} else {
		if !equal {
			t.Errorf("FAILED, expected valueOne to be equal to valueTwo\nvalueOne:%+v\nvalueTwo:%+v", valueOne, valueTwo)
		}
	}

	valueOne, valueTwo = []any{1, 2, 3}, []any{1, 2, 3}
	if equal, err := AreValuesEqual(&valueOne, &valueTwo); err != nil {
		t.Errorf("\nFAILED, test AreValuesEqual failed, error: %v\nvalueOne:%+v\nvalueTwo:%+v", err, valueOne, valueTwo)
	} else {
		if !equal {
			t.Errorf("FAILED, expected valueOne to be equal to valueTwo\nvalueOne:%+v\nvalueTwo:%+v", valueOne, valueTwo)
		}
	}

	valueOne, valueTwo = 14, "14"
	if equal, err := AreValuesEqual(&valueOne, &valueTwo); err != nil {
		t.Errorf("\nFAILED, test AreValuesEqual failed, error: %v\nvalueOne:%+v\nvalueTwo:%+v", err, valueOne, valueTwo)
	} else {
		if equal {
			t.Errorf("FAILED, expected valueOne to NOT be equal to valueTwo\nvalueOne:%+v\nvalueTwo:%+v", valueOne, valueTwo)
		}
	}

	type Four struct {
		One   string
		Two   int
		Three []any
	}

	valueOne = map[string]any{
		"1": 1,
		"2": 2,
		"3": 3,
		"4": Four{
			One: "2",
			Two: 45,
			Three: []any{
				nil,
				nil,
				map[string]any{
					"willy": "willy",
				},
			},
		},
	}

	valueTwo = map[string]any{
		"1": 1,
		"2": 2,
		"3": 3,
		"4": Four{
			One: "2",
			Two: 45,
			Three: []any{
				nil,
				nil,
				map[string]any{
					"willy": "willy",
				},
			},
		},
	}

	if equal, err := AreValuesEqual(&valueOne, &valueTwo); err != nil {
		t.Errorf("\nFAILED, test AreValuesEqual failed, error: %v\nvalueOne:%+v\nvalueTwo:%+v", err, valueOne, valueTwo)
	} else {
		if !equal {
			t.Errorf("FAILED, expected valueOne to be equal to valueTwo\nvalueOne:%+v\nvalueTwo:%+v", valueOne, valueTwo)
		}
	}

	valueOne = map[string]any{
		"1": 1,
		"2": 2,
		"3": 3,
		"4": Four{
			One: "2",
			Two: 45,
			Three: []any{
				nil,
				nil,
				map[string]any{
					"willy": "willy",
				},
				nil,
			},
		},
	}

	valueTwo = map[string]any{
		"1": 1,
		"2": 2,
		"3": 3,
		"4": Four{
			One: "2",
			Two: 45,
			Three: []any{
				nil,
				nil,
				map[string]any{
					"willy": "willy",
				},
			},
		},
	}

	if equal, err := AreValuesEqual(&valueOne, &valueTwo); err != nil {
		t.Errorf("\nFAILED, test AreValuesEqual failed, error: %v\nvalueOne:%+v\nvalueTwo:%+v", err, valueOne, valueTwo)
	} else {
		if equal {
			t.Errorf("FAILED, expected valueOne to NOT be equal to valueTwo\nvalueOne:%+v\nvalueTwo:%+v", valueOne, valueTwo)
		}
	}

	valueOne = map[string]any{
		"1": 1,
		"2": 2,
		"4": Four{
			One: "2",
			Two: 45,
			Three: []any{
				nil,
				nil,
				map[string]any{
					"willy": "willy",
				},
				nil,
			},
		},
		"3": 3,
	}

	valueTwo = map[string]any{
		"1": 1,
		"3": 3,
		"4": Four{
			Three: []any{
				nil,
				nil,
				map[string]any{
					"willy": "willy",
				},
			},
			One: "2",
			Two: 45,
		},
		"2": 2,
	}

	if equal, err := AreValuesEqual(&valueOne, &valueTwo); err != nil {
		t.Errorf("\nFAILED, test AreValuesEqual failed, error: %v\nvalueOne:%+v\nvalueTwo:%+v", err, valueOne, valueTwo)
	} else {
		if equal {
			t.Errorf("FAILED, expected valueOne to NOT be equal to valueTwo\nvalueOne:%+v\nvalueTwo:%+v", valueOne, valueTwo)
		}
	}

	valueOne = map[string]any{
		"1": 1,
		"2": 2,
		"4": Four{
			One: "2",
			Two: 45,
			Three: []any{
				nil,
				nil,
				map[string]any{
					"willy": "willy",
				},
				nil,
			},
		},
		"3":   3,
		"six": 6,
	}

	valueTwo = map[string]any{
		"1": 1,
		"3": 3,
		"4": Four{
			Three: []any{
				nil,
				nil,
				map[string]any{
					"willy": "willy",
				},
			},
			One: "2",
			Two: 45,
		},
		"2": 2,
	}

	if equal, err := AreValuesEqual(&valueOne, &valueTwo); err != nil {
		t.Errorf("\nFAILED, test AreValuesEqual failed, error: %v\nvalueOne:%+v\nvalueTwo:%+v", err, valueOne, valueTwo)
	} else {
		if equal {
			t.Errorf("FAILED, expected valueOne to NOT be equal to valueTwo\nvalueOne:%+v\nvalueTwo:%+v", valueOne, valueTwo)
		}
	}

	valueOne = Four{
		Three: []any{
			nil,
			nil,
			map[string]any{
				"willy": "willy",
			},
		},
		One: "2",
		Two: 45,
	}

	valueTwo = Four{
		Three: []any{
			nil,
			nil,
			map[string]any{
				"willy": "willy",
			},
		},
		One: "2",
		Two: 45,
	}

	if equal, err := AreValuesEqual(&valueOne, &valueTwo); err != nil {
		t.Errorf("\nFAILED, test AreValuesEqual failed, error: %v\nvalueOne:%+v\nvalueTwo:%+v", err, valueOne, valueTwo)
	} else {
		if !equal {
			t.Errorf("FAILED, expected valueOne to be equal to valueTwo\nvalueOne:%+v\nvalueTwo:%+v", valueOne, valueTwo)
		}
	}

	valueOne = Four{
		Three: []any{
			nil,
			nil,
			map[string]any{
				"willy": "willy",
			},
		},
		One: "2",
		Two: 45,
	}

	valueTwo = Four{
		One: "2",
		Two: 45,
	}

	if equal, err := AreValuesEqual(&valueOne, &valueTwo); err != nil {
		t.Errorf("\nFAILED, test AreValuesEqual failed, error: %v\nvalueOne:%+v\nvalueTwo:%+v", err, valueOne, valueTwo)
	} else {
		if equal {
			t.Errorf("FAILED, expected valueOne to NOT be equal to valueTwo\nvalueOne:%+v\nvalueTwo:%+v", valueOne, valueTwo)
		}
	}
}

func TestForEachValueInObject(t *testing.T) {
	var originalObject any = map[string]any{
		"child": []any{
			nil,
			map[string]any{
				"nectar": map[string]any{
					"willy": []any{
						nil, nil, nil, nil, nil, []any{nil, nil, nil, "smitty"}, nil, nil, nil, nil, nil, nil, nil, nil, nil,
						map[string]any{
							"oxford": "willow",
							"bee":    []any{nil, nil, nil, 5},
						},
					},
					"two": []any{1, 2, 3, 4, 5},
				},
				"mocha": struct {
					Nacho  string
					Amount float64
				}{
					Nacho:  "cheese",
					Amount: 45.56,
				},
			},
			nil,
			nil,
			"another child",
		},
	}
	var path string = "$.child[20].wind"

	if _, err := ForEachValueInObject(&originalObject, path, func(currentValuePathKeyArrayIndexes []any, valueFound any) bool {
		t.Errorf("\nFAILED, expected to not find value at path%v\nobject:%+v", path, originalObject)
		return false
	}); err != nil {
		t.Errorf("\nFAILED, test ForEachValueInObject failed, error: %v\nobject:%+v", err, originalObject)
	}

	path = "$.child[1].nectar.two[*]"
	counter := 1
	if _, err := ForEachValueInObject(&originalObject, path, func(currentValuePathKeyArrayIndexes []any, valueFound any) bool {
		if reflect.TypeOf(valueFound).Kind() != reflect.Float64 || fmt.Sprintf("%v", counter) != fmt.Sprintf("%v", valueFound) {
			t.Errorf(
				"\nFAILED, expected value at path%v to be %v, found %+v\nvalueFoundType:%v\nobject:%+v",
				fmt.Sprintf("$.child[1].nectar.two[%v]", counter-1), counter, valueFound, reflect.TypeOf(valueFound).Kind(), originalObject,
			)
		}
		counter += 1
		return false
	}); err != nil {
		t.Errorf("\nFAILED, test ForEachValueInObject failed, error: %v\nobject:%+v", err, originalObject)
	}

}
