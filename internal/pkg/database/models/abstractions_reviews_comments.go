package models

import (
	"time"

	"github.com/gofrs/uuid/v5"
)

type AbstractionsReviewsComments struct {
	ID                               []uuid.UUID `json:"id,omitempty"`
	AbstractionsID                   []uuid.UUID `json:"abstractions_id,omitempty"`
	DirectoryID                      []uuid.UUID `json:"directory_id,omitempty"`
	Comment                          []string    `json:"comment,omitempty"`
	CreatedOn                        []time.Time `json:"created_on,omitempty"`
	CreationIamGroupAuthorizationsID []uuid.UUID `json:"creation_iam_group_authorizations_id,omitempty"`
}

type abstractionsReviewsCommentsTable struct {
	TableName string

	ID                               string
	AbstractionsID                   string
	DirectoryID                      string
	Comment                          string
	CreatedOn                        string
	CreationIamGroupAuthorizationsID string
}

func AbstractionsReviewsCommentsTable() abstractionsReviewsCommentsTable {
	return abstractionsReviewsCommentsTable{
		TableName: "abstractions_reviews_comments",

		ID:                               "id",
		AbstractionsID:                   "abstractions_id",
		DirectoryID:                      "directory_id",
		Comment:                          "comment",
		CreatedOn:                        "created_on",
		CreationIamGroupAuthorizationsID: "creation_iam_group_authorizations_id",
	}
}
