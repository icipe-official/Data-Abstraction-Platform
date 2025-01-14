package metadatamodel

import (
	"errors"
	"fmt"
	"regexp"
	"strings"
)

const (
	ARRAY_PATH_PLACEHOLDER string = "[*]"
)

const (
	FIELD_TYPE_TEXT      string = "text"
	FIELD_TYPE_NUMBER    string = "number"
	FIELD_TYPE_BOOLEAN   string = "boolean"
	FIELD_TYPE_TIMESTAMP string = "timestamp"
	FIELD_TYPE_ANY       string = "any"
	FIELD_TYPE_UUID      string = "uuid"
)

const (
	FIELD_UI_TEXT     string = "text"
	FIELD_UI_TEXTAREA string = "textarea"
	FIELD_UI_NUMBER   string = "number"
	FIELD_UI_CHECKBOX string = "checkbox"
	FIELD_UI_SELECT   string = "select"
	FIELD_UI_DATETIME string = "datetime"
	FIELD_UI_GROUP    string = "group"
	FIELD_UI_UUID     string = "uuid"
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
	FILTER_KEY_NEGATE    string = "$FILTER_NEGATE"
	FILTER_KEY_CONDITION string = "$FILTER_CONDITION"
	FILTER_KEY_VALUE     string = "$FILTER_VALUE"
)

const (
	FILTER_LOGICAL_OPERATOR_AND     string = "AND"
	FILTER_LOGICAL_OPERATOR_OR      string = "OR"
	FILTER_LOGICAL_OPERATOR_AND_NOT string = "AND NOT"
	FILTER_LOGICAL_OPERATOR_OR_NOT  string = "OR NOT"
)

const (
	FILTER_CONDITION_GROUP_CONTAINING_FIELDS                string = "FILTER_G_CONTAINING_FIELDS"
	FILTER_CONDITION_FIELD_CONTAINING_VALUE                 string = "FILTER_F_CONTAINING_VALUE"
	FILTER_CONDITION_FIELD_GROUP_NO_OF_ENTRIES_GREATER_THAN string = "FILTER_FG_NO_OF_ENTRIES_GREATER_THAN"
	FILTER_CONDITION_FIELD_GROUP_NO_OF_ENTRIES_LESS_THAN    string = "FILTER_FG_NO_OF_ENTRIES_LESS_THAN"
	FILTER_CONDITION_FIELD_GROUP_NO_OF_ENTRIES_EQUAL_TO     string = "FILTER_FG_NO_OF_ENTRIES_EQUAL_TO"
	FILTER_CONDITION_FIELD_FULL_TEXT_SEARCH                 string = "FILTER_F_FULL_TEXT_SEARCH"
	FILTER_CONDITION_FIELD_GREATER_THAN                     string = "FILTER_F_GREATER_THAN"
	FILTER_CONDITION_FIELD_LESS_THAN                        string = "FILTER_F_LESS_THAN"
	FILTER_CONDITION_FIELD_EQUAL_TO                         string = "FILTER_F_EQUAL_TO"
	FILTER_CONDITION_FIELD_TEXT_BEGINS_WITH                 string = "FILTER_F_TEXT_BEGINS_WITH"
	FILTER_CONDITION_FIELD_TEXT_ENDS_WITH                   string = "FILTER_F_TEXT_ENDS_WITH"
	FILTER_CONDITION_FIELD_TEXT_CONTAINS                    string = "FILTER_F_TEXT_CONTAINS"
)

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

type MetadataModelSearchResults struct {
	MetadataModel MetadataModel `json:"metadata_model"`
	Data          any           `json:"data"`
}

var ErrArgumentsInvalid = errors.New("ErrArgumentsInvalid")
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
