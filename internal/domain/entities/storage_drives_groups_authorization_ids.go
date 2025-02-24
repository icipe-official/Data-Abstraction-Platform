package entities

import (
	"github.com/gofrs/uuid/v5"
)

type StorageDrivesGroupsAuthorizationsIDs struct {
	StorageDrivesID                      []uuid.UUID `json:"storage_drives_id,omitempty"`
	DirectoryGroupsID                    []uuid.UUID `json:"directory_groups_id,omitempty"`
	CreationIamGroupAuthorizationsID     []uuid.UUID `json:"creation_iam_group_authorizations_id,omitempty"`
	DeactivationIamGroupAuthorizationsID []uuid.UUID `json:"deactivation_iam_group_authorizations_id,omitempty"`
}

type storageDrivesGroupsAuthorizationIDsRepository struct {
	RepositoryName string

	StorageDrivesID                      string
	DirectoryGroupsID                    string
	CreationIamGroupAuthorizationsID     string
	DeactivationIamGroupAuthorizationsID string
}

func StorageDrivesGroupsAuthorizationIDsRepository() storageDrivesGroupsAuthorizationIDsRepository {
	return storageDrivesGroupsAuthorizationIDsRepository{
		RepositoryName: "storage_drives_groups_authorization_ids",

		StorageDrivesID:                      "storage_drives_id",
		DirectoryGroupsID:                    "directory_groups_id",
		CreationIamGroupAuthorizationsID:     "creation_iam_group_authorizations_id",
		DeactivationIamGroupAuthorizationsID: "deactivation_iam_group_authorizations_id",
	}
}
