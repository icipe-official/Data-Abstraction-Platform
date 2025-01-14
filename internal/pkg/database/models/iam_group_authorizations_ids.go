package models

import (
	"github.com/gofrs/uuid/v5"
)

type IamGroupAuthorizationsIDs struct {
	ID                                   []uuid.UUID `json:"id,omitempty"`
	CreationIamGroupAuthorizationsID     []uuid.UUID `json:"creation_iam_group_authorizations_id,omitempty"`
	DeactivationIamGroupAuthorizationsID []uuid.UUID `json:"deactivation_iam_group_authorizations_id,omitempty"`
}

type iamGroupAuthorizationsIDsTable struct {
	TableName string

	ID                                   string
	CreationIamGroupAuthorizationsID     string
	DeactivationIamGroupAuthorizationsID string
}

func IamGroupAuthorizationsIDsTable() iamGroupAuthorizationsIDsTable {
	return iamGroupAuthorizationsIDsTable{
		TableName: "iam_group_authorizations_ids",

		ID:                                   "id",
		CreationIamGroupAuthorizationsID:     "creation_iam_group_authorizations_id",
		DeactivationIamGroupAuthorizationsID: "deactivation_iam_group_authorizations_id",
	}
}
