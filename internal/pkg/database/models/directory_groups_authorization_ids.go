package models

import (
	"github.com/gofrs/uuid/v5"
)

type DirectoryGroupsAuthorizationIDs struct {
	ID                                   []uuid.UUID `json:"id,omitempty"`
	CreationIamGroupAuthorizationsID     []uuid.UUID `json:"creation_iam_group_authorizations_id,omitempty"`
	DeactivationIamGroupAuthorizationsID []uuid.UUID `json:"deactivation_iam_group_authorizations_id,omitempty"`
}

type directoryGroupsAuthorizationIDsTable struct {
	TableName string

	ID                                   string
	CreationIamGroupAuthorizationsID     string
	DeactivationIamGroupAuthorizationsID string
}

func DirectoryGroupsAuthorizationIDsTable() directoryGroupsAuthorizationIDsTable {
	return directoryGroupsAuthorizationIDsTable{
		TableName: "directory_groups_authorization_ids",

		ID:                                   "id",
		CreationIamGroupAuthorizationsID:     "creation_iam_group_authorizations_id",
		DeactivationIamGroupAuthorizationsID: "deactivation_iam_group_authorizations_id",
	}
}
