package metadatamodel

import (
	"errors"
	"reflect"
	"strings"

	intpkgjson "github.com/icipe-official/Data-Abstraction-Platform/internal/pkg/json"
)

func DatabaseGetColumnFieldValue(metadatamodel any, columnFieldName string, tableCollectionName string, valueToGetFrom any, tableCollectionUID string, skipIfFGDisabled bool, skipIfDataExtraction bool) (any, error) {
	if len(columnFieldName) == 0 {
		return nil, FunctionNameAndError(DatabaseGetColumnFieldValue, errors.New("columnFieldName is empty"))
	}

	databaseColumnFields, err := DatabaseGetColumnFields(metadatamodel, tableCollectionName, tableCollectionUID, skipIfFGDisabled, skipIfDataExtraction)
	if err != nil {
		return nil, FunctionNameAndError(DatabaseGetColumnFieldValue, err)
	}

	if columnField, ok := databaseColumnFields.Fields[columnFieldName]; ok {
		if columnFieldMap, ok := columnField.(map[string]any); ok {
			pathToColumnFieldValue, err := GetValueAsString(columnFieldMap[FIELD_2D_POSITION_PROP_FIELD_GROUP_KEY])
			if err != nil {
				return nil, FunctionNameAndError(DatabaseGetColumnFieldValue, err)
			}

			pathToColumnFieldValue = strings.Replace(pathToColumnFieldValue, ".$GROUP_FIELDS[*]", "", 1)
			pathToColumnFieldValue = string(GROUP_FIELDS_REGEX_SEARCH().ReplaceAll([]byte(pathToColumnFieldValue), []byte("")))
			pathToColumnFieldValue = string(ARRAY_PATH_REGEX_SEARCH().ReplaceAll([]byte(pathToColumnFieldValue), []byte(ARRAY_PATH_PLACEHOLDER)))

			return intpkgjson.GetValueInObject(valueToGetFrom, pathToColumnFieldValue), nil
		} else {
			return nil, argumentsError(DatabaseGetColumnFieldValue, "columnFieldMap", "map[string]any", columnField)
		}
	} else {
		return nil, FunctionNameAndError(DatabaseGetColumnFieldValue, errors.New("columnField is empty"))
	}
}

func DatabaseDeleteColumnFieldValue(metadatamodel any, columnFieldName string, tableCollectionName string, valueToDeleteIn any, tableCollectionUID string, skipIfFGDisabled bool, skipIfDataExtraction bool) (any, error) {
	if len(columnFieldName) == 0 {
		return nil, FunctionNameAndError(DatabaseDeleteColumnFieldValue, errors.New("columnField is empty"))
	}

	databaseColumnFields, err := DatabaseGetColumnFields(metadatamodel, tableCollectionName, tableCollectionUID, skipIfFGDisabled, skipIfDataExtraction)
	if err != nil {
		return nil, FunctionNameAndError(DatabaseDeleteColumnFieldValue, err)
	}

	if columnField, ok := databaseColumnFields.Fields[columnFieldName]; ok {
		if columnFieldMap, ok := columnField.(map[string]any); ok {
			pathToColumnFieldValue, err := GetValueAsString(columnFieldMap[FIELD_2D_POSITION_PROP_FIELD_GROUP_KEY])
			if err != nil {
				return nil, FunctionNameAndError(DatabaseDeleteColumnFieldValue, err)
			}

			pathToColumnFieldValue = strings.Replace(pathToColumnFieldValue, ".$GROUP_FIELDS[*]", "", 1)
			pathToColumnFieldValue = string(GROUP_FIELDS_REGEX_SEARCH().ReplaceAll([]byte(pathToColumnFieldValue), []byte("")))
			pathToColumnFieldValue = string(ARRAY_PATH_REGEX_SEARCH().ReplaceAll([]byte(pathToColumnFieldValue), []byte(ARRAY_PATH_PLACEHOLDER)))

			return intpkgjson.DeleteValueInObject(valueToDeleteIn, pathToColumnFieldValue), nil
		} else {
			return nil, argumentsError(DatabaseDeleteColumnFieldValue, "columnFieldMap", "map[string]any", columnField)
		}
	} else {
		return nil, FunctionNameAndError(DatabaseDeleteColumnFieldValue, errors.New("columnField is empty"))
	}
}

func DatabaseSetColumnFieldValue(metadatamodel any, columnFieldName string, tableCollectionName string, valueToGetIn any, value any, tableCollectionUID string, skipIfFGDisabled bool, skipIfDataExtraction bool) (any, error) {
	if len(columnFieldName) == 0 {
		return nil, FunctionNameAndError(DatabaseSetColumnFieldValue, errors.New("columnField is empty"))
	}

	databaseColumnFields, err := DatabaseGetColumnFields(metadatamodel, tableCollectionName, tableCollectionUID, skipIfFGDisabled, skipIfDataExtraction)
	if err != nil {
		return nil, FunctionNameAndError(DatabaseSetColumnFieldValue, err)
	}

	if columnField, ok := databaseColumnFields.Fields[columnFieldName]; ok {
		if columnFieldMap, ok := columnField.(map[string]any); ok {
			pathToColumnFieldValue, err := GetValueAsString(columnFieldMap[FIELD_2D_POSITION_PROP_FIELD_GROUP_KEY])
			if err != nil {
				return nil, FunctionNameAndError(DatabaseSetColumnFieldValue, err)
			}

			pathToColumnFieldValue = strings.Replace(pathToColumnFieldValue, ".$GROUP_FIELDS[*]", "", 1)
			pathToColumnFieldValue = string(GROUP_FIELDS_REGEX_SEARCH().ReplaceAll([]byte(pathToColumnFieldValue), []byte("")))
			pathToColumnFieldValue = string(ARRAY_PATH_REGEX_SEARCH().ReplaceAll([]byte(pathToColumnFieldValue), []byte(ARRAY_PATH_PLACEHOLDER)))

			if reflect.TypeOf(value).Kind() == reflect.Slice || reflect.TypeOf(value).Kind() == reflect.Array {
				return intpkgjson.SetValueInObject(valueToGetIn, pathToColumnFieldValue, value)
			}

			return intpkgjson.SetValueInObject(valueToGetIn, pathToColumnFieldValue, []any{value})
		} else {
			return nil, argumentsError(DatabaseSetColumnFieldValue, "columnFieldMap", "map[string]any", columnField)
		}
	} else {
		return nil, FunctionNameAndError(DatabaseSetColumnFieldValue, errors.New("columnField is empty"))
	}
}
