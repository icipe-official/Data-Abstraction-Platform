package entities

import (
	"time"

	"github.com/gofrs/uuid/v5"
)

type AbstractionsReviews struct {
	AbstractionsReviewsID []struct {
		AbstractionsID []uuid.UUID `json:"abstractions_id,omitempty"`
		DirectoryID    []uuid.UUID `json:"directory_id,omitempty"`
	} `json:"abstractions_reviews_id,omitempty"`
	Pass                             []bool      `json:"pass,omitempty"`
	CreatedOn                        []time.Time `json:"created_on,omitempty"`
	LastUpdatedOn                    []time.Time `json:"last_updated_on,omitempty"`
	CreationIamGroupAuthorizationsID []uuid.UUID `json:"creation_iam_group_authorizations_id,omitempty"`
}

type abstractionsReviewsRepository struct {
	RepositoryName string

	AbstractionsID                   string
	DirectoryID                      string
	Pass                             string
	CreatedOn                        string
	LastUpdatedOn                    string
	CreationIamGroupAuthorizationsID string
}

func AbstractionsReviewsRepository() abstractionsReviewsRepository {
	return abstractionsReviewsRepository{
		RepositoryName: "abstractions_reviews",

		AbstractionsID:                   "abstractions_id",
		DirectoryID:                      "directory_id",
		Pass:                             "pass",
		CreatedOn:                        "created_on",
		LastUpdatedOn:                    "last_updated_on",
		CreationIamGroupAuthorizationsID: "creation_iam_group_authorizations_id",
	}
}
