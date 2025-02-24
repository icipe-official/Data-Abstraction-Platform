package entities

import (
	"time"

	"github.com/gofrs/uuid/v5"
)

type Directory struct {
	ID                []uuid.UUID `json:"id,omitempty"`
	DirectoryGroupsID []uuid.UUID `json:"directory_groups_id,omitempty"`
	Data              []any       `json:"data,omitempty"`
	CreatedOn         []time.Time `json:"created_on,omitempty"`
	LastUpdatedOn     []time.Time `json:"last_updated_on,omitempty"`
	DeactivatedOn     []time.Time `json:"deactivated_on,omitempty"`
}

type directoryRepository struct {
	RepositoryName string

	ID                string
	DirectoryGroupsID string
	Data              string
	CreatedOn         string
	LastUpdatedOn     string
	DeactivatedOn     string
	FullTextSearch    string
}

func DirectoryRepository() directoryRepository {
	return directoryRepository{
		RepositoryName: "directory",

		ID:                "id",
		DirectoryGroupsID: "directory_groups_id",
		Data:              "data",
		CreatedOn:         "created_on",
		LastUpdatedOn:     "last_updated_on",
		DeactivatedOn:     "deactivated_on",
		FullTextSearch:    "full_text_search",
	}
}
