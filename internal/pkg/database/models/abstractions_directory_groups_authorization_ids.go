package models

import (
	"github.com/gofrs/uuid/v5"
)

type AbstractionsDirectoryGroupsAuthorizationIDs struct {
	DirectoryGroupsID                    []uuid.UUID `json:"directory_groups_id,omitempty"`
	CreationIamGroupAuthorizationsID     []uuid.UUID `json:"creation_iam_group_authorizations_id,omitempty"`
	DeactivationIamGroupAuthorizationsID []uuid.UUID `json:"deactivation_iam_group_authorizations_id,omitempty"`
}

type abstractionsDirectoryGroupsAuthorizationIDs struct {
	TableName string

	DirectoryGroupsID                    string
	CreationIamGroupAuthorizationsID     string
	DeactivationIamGroupAuthorizationsID string
}

func AbstractionsDirectoryGroupsAuthorizationIDsTable() abstractionsDirectoryGroupsAuthorizationIDs {
	return abstractionsDirectoryGroupsAuthorizationIDs{
		TableName: "abstractions_directory_groups_authorization_ids",

		DirectoryGroupsID:                    "directory_groups_id",
		CreationIamGroupAuthorizationsID:     "creation_iam_group_authorizations_id",
		DeactivationIamGroupAuthorizationsID: "deactivation_iam_group_authorizations_id",
	}
}
