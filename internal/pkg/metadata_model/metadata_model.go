package metadatamodel

import (
	"errors"
	"fmt"
	"reflect"
	"regexp"
	"strings"
)

const (
	QUERY_CONDITION_PROP_FG_PROPERTY              string = "$FG_PROPERTY"
	QUERY_CONDITION_PROP_FG_FILTER_CONDITION      string = "$FG_FILTER_CONDITION"
	QUERY_CONDITION_PROP_D_SORT_BY_ASC            string = "$D_SORT_BY_ASC"
	QUERY_CONDITION_PROP_D_FULL_TEXT_SEARCH_QUERY string = "$D_FULL_TEXT_SEARCH_QUERY"
)

const (
	FILTER_CONDITION_PROP_FILTER_NEGATE    string = "$FILTER_NEGATE"
	FILTER_CONDITION_PROP_FILTER_CONDITION string = "$FILTER_CONDITION"
	FILTER_CONDITION_PROP_FILTER_VALUE     string = "$FILTER_VALUE"
)

const (
	FILTER_CONDTION_NO_OF_ENTRIES_GREATER_THAN string = "NO_OF_ENTRIES_GREATER_THAN"
	FILTER_CONDTION_NO_OF_ENTRIES_LESS_THAN    string = "NO_OF_ENTRIES_LESS_THAN"
	FILTER_CONDTION_NO_OF_ENTRIES_EQUAL_TO     string = "NO_OF_ENTRIES_EQUAL_TO"
	FILTER_CONDTION_NUMBER_GREATER_THAN        string = "NUMBER_GREATER_THAN"
	FILTER_CONDTION_NUMBER_LESS_THAN           string = "NUMBER_LESS_THAN"
	FILTER_CONDTION_TIMESTAMP_GREATER_THAN     string = "TIMESTAMP_GREATER_THAN"
	FILTER_CONDTION_TIMESTAMP_LESS_THAN        string = "TIMESTAMP_LESS_THAN"
	FILTER_CONDTION_EQUAL_TO                   string = "EQUAL_TO"
	FILTER_CONDTION_TEXT_BEGINS_WITH           string = "TEXT_BEGINS_WITH"
	FILTER_CONDTION_TEXT_ENDS_WITH             string = "TEXT_ENDS_WITH"
	FILTER_CONDTION_TEXT_CONTAINS              string = "TEXT_CONTAINS"
)

const (
	FIELD_TYPE_TEXT      string = "text"
	FIELD_TYPE_NUMBER    string = "number"
	FIELD_TYPE_BOOLEAN   string = "boolean"
	FIELD_TYPE_TIMESTAMP string = "timestamp"
	FIELD_TYPE_ANY       string = "any"
)

const (
	FIELD_UI_TEXT     string = "text"
	FIELD_UI_TEXTAREA string = "textarea"
	FIELD_UI_NUMBER   string = "number"
	FIELD_UI_CHECKBOX string = "checkbox"
	FIELD_UI_SELECT   string = "select"
	FIELD_UI_DATETIME string = "datetime"
	FIELD_UI_GROUP    string = "group"
)

const (
	FIELD_DATE_TIME_FORMAT_YYYYMMDDHHMM string = "yyyy-mm-dd hh:mm"
	FIELD_DATE_TIME_FORMAT_YYYYMMDD     string = "yyyy-mm-dd"
	FIELD_DATE_TIME_FORMAT_YYYYMM       string = "yyyy-mm"
	FIELD_DATE_TIME_FORMAT_HHMM         string = "hh:mm"
	FIELD_DATE_TIME_FORMAT_YYYY         string = "yyyy"
	FIELD_DATE_TIME_FORMAT_MM           string = "mm"
)

const (
	FIELD_SELECT_PROP_TYPE  string = "$TYPE"
	FIELD_SELECT_PROP_LABEL string = "$LABEL"
	FIELD_SELECT_PROP_VALUE string = "$VALUE"
)

const (
	FIELD_SELECT_TYPE_NUMBER  string = "number"
	FIELD_SELECT_TYPE_TEXT    string = "text"
	FIELD_SELECT_TYPE_BOOLEAN string = "boolean"
)

const (
	FIELD_CHECKBOX_VALUE_PROP_TYPE  string = "$TYPE"
	FIELD_CHECKBOX_VALUE_PROP_VALUE string = "$VALUE"
)

const (
	FIELD_GROUP_PROP_FIELD_GROUP_KEY                                       string = "$FIELD_GROUP_KEY"
	FIELD_GROUP_PROP_FIELD_GROUP_NAME                                      string = "$FIELD_GROUP_NAME"
	FIELD_GROUP_PROP_FIELD_GROUP_DESCRIPTION                               string = "$FIELD_GROUP_DESCRIPTION"
	FIELD_GROUP_PROP_FIELD_GROUP_VIEW_TABLE_LOCK_COLUMN                    string = "$FIELD_GROUP_VIEW_TABLE_LOCK_COLUMN"
	FIELD_GROUP_PROP_GROUP_VIEW_TABLE_IN_2D                                string = "$GROUP_VIEW_TABLE_IN_2D"
	FIELD_GROUP_PROP_GROUP_QUERY_ADD_FULL_TEXT_SEARCH_BOX                  string = "$GROUP_QUERY_ADD_FULL_TEXT_SEARCH_BOX"
	FIELD_GROUP_PROP_FIELD_GROUP_IS_PRIMARY_KEY                            string = "$FIELD_GROUP_IS_PRIMARY_KEY"
	FIELD_GROUP_PROP_FIELD_DATATYPE                                        string = "$FIELD_DATATYPE"
	FIELD_GROUP_PROP_FIELD_UI                                              string = "$FIELD_UI"
	FIELD_GROUP_PROP_FIELD_GROUP_VIEW_VALUES_IN_SEPARATE_COLUMNS           string = "$FIELD_GROUP_VIEW_VALUES_IN_SEPARATE_COLUMNS"
	FIELD_GROUP_PROP_FIELD_GROUP_VIEW_MAX_NO_OF_VALUES_IN_SEPARATE_COLUMNS string = "$FIELD_GROUP_VIEW_MAX_NO_OF_VALUES_IN_SEPARATE_COLUMNS"
	FIELD_GROUP_PROP_FIELD_VIEW_VALUES_IN_SEPARATE_COLUMNS_HEADER_FORMAT   string = "$FIELD_VIEW_VALUES_IN_SEPARATE_COLUMNS_HEADER_FORMAT"
	FIELD_GROUP_PROP_FIELD_VIEW_VALUES_IN_SEPARATE_COLUMNS_HEADER_INDEX    string = "$FIELD_VIEW_VALUES_IN_SEPARATE_COLUMNS_HEADER_INDEX"
	FIELD_GROUP_PROP_FIELD_INPUT_PLACEHOLDER                               string = "$FIELD_INPUT_PLACEHOLDER"
	FIELD_GROUP_PROP_FIELD_DATETIME_FORMAT                                 string = "$FIELD_DATETIME_FORMAT"
	FIELD_GROUP_PROP_FIELD_SELECT_OPTIONS                                  string = "$FIELD_SELECT_OPTIONS"
	FIELD_GROUP_PROP_FIELD_PLACEHOLDER                                     string = "$FIELD_PLACEHOLDER"
	FIELD_GROUP_PROP_FIELD_GROUP_MAX_ENTRIES                               string = "$FIELD_GROUP_MAX_ENTRIES"
	FIELD_GROUP_PROP_FIELD_DEFAULT_VALUE                                   string = "$FIELD_DEFAULT_VALUE"
	FIELD_GROUP_PROP_FIELD_GROUP_INPUT_DISABLE                             string = "$FIELD_GROUP_INPUT_DISABLE"
	FIELD_GROUP_PROP_FIELD_GROUP_DISABLE_PROPERTIES_EDIT                   string = "$FIELD_GROUP_DISABLE_PROPERTIES_EDIT"
	FIELD_GROUP_PROP_DATABASE_FIELD_ADD_DATA_TO_FULL_TEXT_SEARCH_INDEX     string = "$DATABASE_FIELD_ADD_DATA_TO_FULL_TEXT_SEARCH_INDEX"
	FIELD_GROUP_PROP_FIELD_CHECKBOX_VALUE_IF_TRUE                          string = "$FIELD_CHECKBOX_VALUE_IF_TRUE"
	FIELD_GROUP_PROP_FIELD_CHECKBOX_VALUE_IF_FALSE                         string = "$FIELD_CHECKBOX_VALUE_IF_FALSE"
	FIELD_GROUP_PROP_FIELD_CHECKBOX_VALUES_USE_IN_VIEW                     string = "$FIELD_CHECKBOX_VALUES_USE_IN_VIEW"
	FIELD_GROUP_PROP_FIELD_CHECKBOX_VALUES_USE_IN_STORAGE                  string = "$FIELD_CHECKBOX_VALUES_USE_IN_STORAGE"
	FIELD_GROUP_PROP_FIELD_GROUP_VIEW_DISABLE                              string = "$FIELD_GROUP_VIEW_DISABLE"
	FIELD_GROUP_PROP_FIELD_GROUP_QUERY_CONDITIONS_EDIT_DISABLE             string = "$FIELD_GROUP_QUERY_CONDITIONS_EDIT_DISABLE"
	FIELD_GROUP_PROP_GROUP_EXTRACT_AS_SINGLE_FIELD                         string = "$GROUP_EXTRACT_AS_SINGLE_FIELD"
	FIELD_GROUP_PROP_GROUP_READ_ORDER_OF_FIELDS                            string = "$GROUP_READ_ORDER_OF_FIELDS"
	FIELD_GROUP_PROP_GROUP_FIELDS                                          string = "$GROUP_FIELDS"
	FIELD_GROUP_PROP_DATABASE_SKIP_DATA_EXTRACTION                         string = "$DATABASE_SKIP_DATA_EXTRACTION"
	FIELD_GROUP_PROP_DATABASE_TABLE_COLLECTION_UID                         string = "$DATABASE_TABLE_COLLECTION_UID"
	FIELD_GROUP_PROP_DATABASE_TABLE_COLLECTION_NAME                        string = "$DATABASE_TABLE_COLLECTION_NAME"
	FIELD_GROUP_PROP_DATABASE_FIELD_COLUMN_NAME                            string = "$DATABASE_FIELD_COLUMN_NAME"
	FIELD_GROUP_PROP_DATUM_INPUT_VIEW                                      string = "$DATUM_INPUT_VIEW"
	FIELD_GROUP_PROP_FIELD_2D_VIEW_POSITION                                string = "$FIELD_2D_VIEW_POSITION"
)

const (
	FIELD_2D_POSITION_PROP_FIELD_GROUP_KEY                                    string = FIELD_GROUP_PROP_FIELD_GROUP_KEY
	FIELD_2D_POSITION_PROP_FIELD_VIEW_VALUES_IN_SEPARATE_COLUMNS_HEADER_INDEX string = FIELD_GROUP_PROP_FIELD_VIEW_VALUES_IN_SEPARATE_COLUMNS_HEADER_INDEX
	FIELD_2D_POSITION_PROP_                                                   string = "$FIELD_POSITION_BEFORE"
)

const (
	ARRAY_PATH_PLACEHOLDER string = "[*]"
)

type MetadataModelSearchResults struct {
	MetadataModel any `json:"metadata_model"`
	Data          any `json:"data"`
}

var ErrPathContainsIndexPlaceHolders = errors.New("PathContainsIndexPlaceHolders")

// Prepares the path to value in an object based on the metadatamodel `$FG_KEY`(OBJECT_KEY_FIELD_GROUP_KEY) property of a field in a group.
//
// Parameters:
//
//   - path - path to value in object. Must begin with `$.$G_FIELDS[*]`.
//     Examples: `$.$G_FIELDS[*].field_1` results in `field_1` and `$.$G_FIELDS[*].group_1.$G_FIELDS[*].group_1_field` results in `group_1[*].group_1_field`.
//
//   - groupIndexes - Each element replaces array index placeholder (ARRAY_PATH_REGEX_SEARCH) `[*]` found in path.
//
//     Must NOT be empty as the first element in groupIndexes removed as it matches the first `$G_FIELDS[*]` in the path which is removed from the path since it indicates the root of the metadata-model.
//
//     Number of elements MUST match number of array index placeholders in path.
//
//     For example, with path like `$.$G_FIELDS[*].group_1.$G_FIELDS[*].group_1_field` the number of array indexes passed in groupIndexes MUST be 2.
//
// The first element in groupIndexes removed as it matches the first `$G_FIELDS[*]` in the path which is removed from the path since it indicates the root of the metadata-model.
//
// For example, path `$.$G_FIELDS[*].group_1.$G_FIELDS[*].group_1_field` will be trimmed to `$.group_1[*].group_1_field` before groupIndexes are added.
//
// Return path to value in object or error if the number of array index placeholders in path being more than the number of array indexes in groupIndexes.
func PreparePathToValueInObject(path string, groupIndexes []int) (string, error) {
	path = strings.Replace(path, ".$G_FIELDS[*]", "", 1)
	path = string(G_FIELDS_REGEX_SEARCH().ReplaceAll([]byte(path), []byte("")))
	groupIndexes = groupIndexes[1:]
	for _, groupIndex := range groupIndexes {
		path = strings.Replace(path, ARRAY_PATH_PLACEHOLDER, fmt.Sprintf("[%v]", groupIndex), 1)
		groupIndexes = groupIndexes[1:]
	}

	if strings.Contains(path, ARRAY_PATH_PLACEHOLDER) {
		return path, ErrPathContainsIndexPlaceHolders
	}

	return path, nil
}

func GroupCanBeProcessAs2D(fieldgroup any) bool {
	if fieldGroupMap, ok := fieldgroup.(map[string]any); ok {
		if groupFieldsArray, ok := fieldGroupMap[FIELD_GROUP_PROP_GROUP_FIELDS].([]any); ok && len(groupFieldsArray) == 1 {
			if groupFieldsMap, ok := groupFieldsArray[0].(map[string]any); ok {
				for _, value := range groupFieldsMap {
					if valueMap, ok := value.(map[string]any); ok {
						if reflect.TypeOf(valueMap[FIELD_GROUP_PROP_GROUP_READ_ORDER_OF_FIELDS]).Kind() == reflect.Slice {
							return false
						}
					}
				}
			} else {
				return false
			}
		} else {
			return false
		}
	}

	return true
}

func IfKeySuffixMatchesValues(keyToCheck string, valuesToMatch []string) bool {
	for _, value := range valuesToMatch {
		if strings.HasSuffix(keyToCheck, value) {
			return true
		}
	}

	return false
}

func ARRAY_PATH_REGEX_SEARCH() *regexp.Regexp {
	return regexp.MustCompile(`\[\*\]`)
}

func G_FIELDS_PATH_REGEX_SEARCH() *regexp.Regexp {
	return regexp.MustCompile(`\$G_FIELDS\[\*\](?:\.|)`)
}

func G_FIELDS_REGEX_SEARCH() *regexp.Regexp {
	return regexp.MustCompile(`(?:\.|)\$G_FIELDS`)
}

func SPECIAL_CHARS_REGEX_SEARCH() *regexp.Regexp {
	return regexp.MustCompile(`[^a-zA-Z0-9]+`)
}

func IsFieldAField(f any) bool {
	if field, ok := f.(map[string]any); ok {
		return reflect.TypeOf(field[FIELD_GROUP_PROP_FIELD_DATATYPE]).Kind() == reflect.String && reflect.TypeOf(field[FIELD_GROUP_PROP_FIELD_UI]).Kind() == reflect.String
	}

	return false
}

func Is2DFieldViewPositionValid(f any) bool {
	if field, ok := f.(map[string]any); ok {
		if field2Dposition, ok := field[FIELD_GROUP_PROP_FIELD_2D_VIEW_POSITION].(map[string]any); ok {
			return reflect.TypeOf(field2Dposition[FIELD_2D_POSITION_PROP_FIELD_GROUP_KEY]).Kind() == reflect.String
		}
	}

	return false
}

func GetFieldGroupName(fg any, defaultValue string) string {
	if fieldGroup, ok := fg.(map[string]any); ok {
		if fieldGroupName, ok := fieldGroup[FIELD_GROUP_PROP_FIELD_GROUP_NAME].(string); ok && len(fieldGroupName) > 0 {
			return fieldGroupName
		}

		if fieldGroupKey, ok := fieldGroup[FIELD_2D_POSITION_PROP_FIELD_GROUP_KEY].(string); ok && len(fieldGroupKey) > 0 {
			fieldGroupKeyParts := strings.Split(fieldGroupKey, ".")
			if len(fieldGroupKeyParts) > 0 {
				return fieldGroupKeyParts[len(fieldGroupKeyParts)-1]
			}
		}
	}

	if len(defaultValue) == 0 {
		return "#unnamed"
	}

	return defaultValue
}

type QueryCondition struct {
	QueryConditionLabel *string             `json:"$QC_LABEL,omitempty"`
	FgProperty          *MetadataModel      `json:"$FG_PROPERTY,omitempty"`
	FgFilterCondition   [][]FilterCondition `json:"$FG_FILTER_CONDITION,omitempty"`
	SortByAsc           map[string]bool     `json:"$D_SORT_BY_ASC,omitempty"`
	SortByDesc          map[string]bool     `json:"$D_SORT_BY_DESC,omitempty"`
	Distinct            *bool               `json:"$D_DISTINCT,omitempty"`
}

type FilterCondition struct {
	FilterNegate    *bool  `json:"$FILTER_NEGATE,omitempty"`
	FilterCondition string `json:"$FILTER_CONDITION,omitempty"`
	FilterValue     []any  `json:"$FILTER_VALUE,omitempty"`
}

type MetadataModel struct {
	FieldGroupKey                                *string `json:"$FG_KEY,omitempty"`
	FieldGroupName                               *string `json:"$FG_NAME,omitempty"`
	FieldGroupDescription                        *string `json:"$FG_DESCRIPTION,omitempty"`
	GroupViewTableIn2D                           *bool   `json:"$G_VIEW_TABLE_IN_2D,omitempty"`
	GroupQueryAddFullTextSearchBox               *bool   `json:"$G_QUERY_ADD_FULL_TEXT_SEARCH_BOX,omitempty"`
	FgIsPrimaryKey                               *bool   `json:"$FG_IS_PRIMARY_KEY,omitempty"`
	FieldDataType                                *string `json:"$F_DATATYPE,omitempty"`
	FieldUi                                      *string `json:"$F_UI,omitempty"`
	FieldGroupViewValuesInSeparateColumns        *bool   `json:"$FG_VIEW_VALUES_IN_SEPARATE_COLUMNS,omitempty"`
	FieldGroupViewMaxNoOfValuesInSeparateColumns *int    `json:"$FG_VIEW_MAX_NO_OF_VALUES_IN_SEPARATE_COLUMNS,omitempty"`
	FieldViewValuesInSeparateColumnsHeaderFormat *string `json:"$F_VIEW_VALUES_IN_SEPARATE_COLUMNS_HEADER_FORMAT,omitempty"`
	FieldViewValuesInSeparateColumnsHeaderIndex  *int    `json:"$F_VIEW_VALUES_IN_SEPARATE_COLUMNS_HEADER_INDEX,omitempty"`
	FieldDatetimeFormat                          *string `json:"$F_DATETIME_FORMAT,omitempty"`
	FieldSelectOptions                           []struct {
		Type  string `json:"$TYPE,omitempty"`
		Label string `json:"$LABEL,omitempty"`
		Value any    `json:"$VALUE,omitempty"`
	} `json:"$F_SELECT_OPTIONS,omitempty"`
	FieldPlaceholder                *string `json:"$F_PLACEHOLDER,omitempty"`
	FieldGroupMaxEntries            *int    `json:"$FG_MAX_ENTRIES,omitempty"`
	FieldDefaultValue               *any    `json:"$F_DEFAULT_VALUE,omitempty"`
	FieldGroupDisableInput          *bool   `json:"$FG_DISABLE_INPUT,omitempty"`
	FieldGroupDisablePropertiesEdit *bool   `json:"$FG_DISABLE_PROPERTIES_EDIT,omitempty"`
	FieldAddToFullTextSearchIndex   *bool   `json:"$F_ADD_TO_FULL_TEXT_SEARCH_INDEX,omitempty"`
	FieldCheckboxValueIfTrue        *any    `json:"$F_CHECKBOX_VALUE_IF_TRUE,omitempty"`
	FieldCheckboxValueIfFalse       *any    `json:"$F_CHECKBOX_VALUE_IF_FALSE,omitempty"`
	FieldCheckboxUseInView          *bool   `json:"$F_CHECKBOX_VALUES_USE_IN_VIEW,omitempty"`
	FieldCheckboxUseInStorage       *bool   `json:"$F_CHECKBOX_VALUES_USE_IN_STORAGE,omitempty"`
	FieldGroupViewDisable           *bool   `json:"$FG_VIEW_DISABLE,omitempty"`
	FieldGroupSkipDataExtraction    *bool   `json:"$FG_SKIP_DATA_EXTRACTION,omitempty"`
	FieldGroupFilterDisable         *bool   `json:"$FG_FILTER_DISABLE,omitempty"`
	GroupExtractAsSingleValue       *bool   `json:"$G_EXTRACT_AS_SINGLE_VALUE,omitempty"`
	MetadataModelGroup
	TableCollectionName *string `json:"$D_TABLE_COLLECTION_NAME,omitempty"`
	FieldColumnName     *string `json:"$D_FIELD_COLUMN_NAME,omitempty"`
}
type MetadataModelGroup struct {
	GroupReadOrderOfFields []string                   `json:"$G_READ_ORDER_OF_FIELDS,omitempty"`
	GroupFieldsIndex       int                        `json:"$G_FIELDS_INDEX,omitempty"`
	GroupFields            []map[string]MetadataModel `json:"$G_FIELDS,omitempty"`
}

type MetadataModelDatabase struct {
	MetadataModel
	TableCollectionName *string `json:"$D_TABLE_COLLECTION_NAME,omitempty"`
	FieldColumnName     *string `json:"$D_FIELD_COLUMN_NAME,omitempty"`
}
