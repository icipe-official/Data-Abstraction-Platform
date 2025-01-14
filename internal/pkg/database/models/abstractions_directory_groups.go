package models

import (
	"time"

	"github.com/gofrs/uuid/v5"
)

type AbstractionsDirectoryGroups struct {
	DirectoryGroupsID       []uuid.UUID `json:"directory_groups_id,omitempty"`
	MetadataModelsID        []uuid.UUID `json:"metadata_models_id,omitempty"`
	Description             []string    `json:"description,omitempty"`
	AbstractionReviewQuorum []bool      `json:"abstraction_review_quorum,omitempty"`
	CreatedOn               []time.Time `json:"created_on,omitempty"`
	LastUpdatedOn           []time.Time `json:"last_updated_on,omitempty"`
	DeactivatedOn           []time.Time `json:"deactivated_on,omitempty"`
}

type abstractionsDirectoryGroupsTable struct {
	TableName string

	DirectoryGroupsID       string
	MetadataModelsID        string
	Description             string
	AbstractionReviewQuorum string
	CreatedOn               string
	LastUpdatedOn           string
	DeactivatedOn           string
}

func AbstractionsDirectoryGroupsTable() abstractionsDirectoryGroupsTable {
	return abstractionsDirectoryGroupsTable{
		TableName: "abstractions_directory_groups",

		DirectoryGroupsID:       "directory_groups_id",
		MetadataModelsID:        "metadata_models_id",
		Description:             "description",
		AbstractionReviewQuorum: "abstraction_review_quorum",
		CreatedOn:               "created_on",
		LastUpdatedOn:           "last_updated_on",
		DeactivatedOn:           "deactivated_on",
	}
}
