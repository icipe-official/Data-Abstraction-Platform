package models

import (
	"github.com/gofrs/uuid/v5"
)

type StorageFilesAuthorizationIDs struct {
	ID                                   []uuid.UUID `json:"id,omitempty"`
	CreationIamGroupAuthorizationsID     []uuid.UUID `json:"creation_iam_group_authorizations_id,omitempty"`
	DeactivationIamGroupAuthorizationsID []uuid.UUID `json:"deactivation_iam_group_authorizations_id,omitempty"`
}

type storageFilesAuthorizationIDsTable struct {
	TableName string

	ID                                   string
	CreationIamGroupAuthorizationsID     string
	DeactivationIamGroupAuthorizationsID string
}

func StorageFilesAuthorizationIDsTable() storageFilesAuthorizationIDsTable {
	return storageFilesAuthorizationIDsTable{
		TableName: "storage_files_authorization_ids",

		ID:                                   "id",
		CreationIamGroupAuthorizationsID:     "creation_iam_group_authorizations_id",
		DeactivationIamGroupAuthorizationsID: "deactivation_iam_group_authorizations_id",
	}
}
