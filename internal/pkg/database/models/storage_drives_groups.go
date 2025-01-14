package models

import (
	"time"

	"github.com/gofrs/uuid/v5"
)

type StorageDrivesGroups struct {
	StorageDrivesID   []uuid.UUID `json:"storage_drives_id,omitempty"`
	DirectoryGroupsID []uuid.UUID `json:"directory_groups_id,omitempty"`
	Description       []string    `json:"description,omitempty"`
	CreatedOn         []time.Time `json:"created_on,omitempty"`
	LastUpdatedOn     []time.Time `json:"last_updated_on,omitempty"`
	DeactivatedOn     []time.Time `json:"deactivated_on,omitempty"`
}

type storageDrivesGroupsTable struct {
	TableName string

	StorageDrivesID   string
	DirectoryGroupsID string
	Description       string
	CreatedOn         string
	LastUpdatedOn     string
	DeactivatedOn     string
}

func StorageDrivesGroupsTable() storageDrivesGroupsTable {
	return storageDrivesGroupsTable{
		TableName: "storage_drives_groups",

		StorageDrivesID:   "storage_drives_id",
		DirectoryGroupsID: "directory_groups_id",
		Description:       "description",
		CreatedOn:         "created_on",
		LastUpdatedOn:     "last_updated_on",
		DeactivatedOn:     "deactivated_on",
	}
}
