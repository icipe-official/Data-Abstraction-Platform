package models

import (
	"time"

	"github.com/gofrs/uuid/v5"
)

type Abstractions struct {
	ID                      []uuid.UUID `json:"id,omitempty"`
	DirectoryGroupsID       []uuid.UUID `json:"directory_groups_id,omitempty"`
	MetadataModelsID        []uuid.UUID `json:"metadata_models_id,omitempty"`
	DirectoryID             []uuid.UUID `json:"directory_id,omitempty"`
	StorageFilesID          []uuid.UUID `json:"storage_files_id,omitempty"`
	Tags                    []string    `json:"tags,omitempty"`
	Data                    []any       `json:"data,omitempty"`
	AbstractionsReviewsPass []bool      `json:"abstractions_reviews_pass,omitempty"`
	CreatedOn               []time.Time `json:"created_on,omitempty"`
	LastUpdatedOn           []time.Time `json:"last_updated_on,omitempty"`
	DeactivatedOn           []time.Time `json:"deactivated_on,omitempty"`
}

type abstractionsTable struct {
	TableName string

	ID                      string
	DirectoryGroupsID       string
	MetadataModelsID        string
	DirectoryID             string
	StorageFilesID          string
	Tags                    string
	Data                    string
	AbstractionsReviewsPass string
	CreatedOn               string
	LastUpdatedOn           string
	DeactivatedOn           string
}

func AbstractionsTable() abstractionsTable {
	return abstractionsTable{
		TableName: "abstractions",

		ID:                      "id",
		DirectoryGroupsID:       "directory_groups_id",
		MetadataModelsID:        "metadata_models_id",
		DirectoryID:             "directory_id",
		StorageFilesID:          "storage_files_id",
		Tags:                    "tags",
		Data:                    "data",
		AbstractionsReviewsPass: "abstractions_reviews_pass",
		CreatedOn:               "created_on",
		LastUpdatedOn:           "last_updated_on",
		DeactivatedOn:           "deactivated_on",
	}
}
