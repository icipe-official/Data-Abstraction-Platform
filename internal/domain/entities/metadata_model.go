package entities

type MetadataModelSearch struct {
	QueryConditions []MetadataModelQueryConditions `json:"query_conditions,omitempty"`
	MetadataModel   map[string]any                 `json:"metadata_model,omitempty"`
}

type MetadataModelDatum struct {
	Datum         any            `json:"datum"`
	MetadataModel map[string]any `json:"metadata_model,omitempty"`
}

type MetadataModelSearchResults struct {
	Data          []any          `json:"data"`
	MetadataModel map[string]any `json:"metadata_model,omitempty"`
}

type MetadataModelQueryConditions map[string]MetadataModelQueryCondition

type MetadataModelQueryCondition struct {
	DatabaseTableCollectionUid  string                           `json:"$DATABASE_TABLE_COLLECTION_UID,omitempty"`
	DatabaseTableCollectionName string                           `json:"$DATABASE_TABLE_COLLECTION_NAME,omitempty"`
	DatabaseFieldColumnName     string                           `json:"$DATABASE_FIELD_COLUMN_NAME,omitempty"`
	FilterCondition             [][]MetadataModelFilterCondition `json:"$FG_FILTER_CONDITION,omitempty"`
	DatabaseFullTextSearchQuery string                           `json:"$D_FULL_TEXT_SEARCH_QUERY,omitempty"`
}

type MetadataModelFilterCondition struct {
	Negate         bool   `json:"$FILTER_NEGATE,omitempty"`
	Condition      string `json:"$FILTER_CONDITION,omitempty"`
	DateTimeFormat string `json:"$FILTER_DATE_TIME_FORMAT,omitempty"`
	Value          any    `json:"$FILTER_VALUE,omitempty"`
}
