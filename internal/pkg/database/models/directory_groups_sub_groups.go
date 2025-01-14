package models

import (
	"github.com/gofrs/uuid/v5"
)

type DirectoryGroupsSubGroups struct {
	ParentGroupID []uuid.UUID `json:"parent_group_id,omitempty"`
	SubGroupID    []uuid.UUID `json:"sub_group_id,omitempty"`
}

type directoryGroupsSubGroupsTable struct {
	TableName string

	ParentGroupID string
	SubGroupID    string
}

func DirectoryGroupsSubGroupsTable() directoryGroupsSubGroupsTable {
	return directoryGroupsSubGroupsTable{
		TableName: "directory_groups_sub_groups",

		ParentGroupID: "parent_group_id",
		SubGroupID:    "sub_group_id",
	}
}
