package models

import (
	"time"

	"github.com/gofrs/uuid/v5"
)

type DirectoryGroups struct {
	ID            []uuid.UUID `json:"id,omitempty"`
	Data          []any       `json:"data,omitempty"`
	CreatedOn     []time.Time `json:"created_on,omitempty"`
	LastUpdatedOn []time.Time `json:"last_updated_on,omitempty"`
	DeactivatedOn []time.Time `json:"deactivated_on,omitempty"`
}

type directoryGroupsTable struct {
	TableName string

	ID             string
	Data           string
	CreatedOn      string
	LastUpdatedOn  string
	DeactivatedOn  string
	FullTextSearch string
}

func DirectoryGroupsTable() directoryGroupsTable {
	return directoryGroupsTable{
		TableName: "directory_groups",

		ID:             "id",
		Data:           "data",
		CreatedOn:      "created_on",
		LastUpdatedOn:  "last_updated_on",
		DeactivatedOn:  "deactivated_on",
		FullTextSearch: "full_text_search",
	}
}
