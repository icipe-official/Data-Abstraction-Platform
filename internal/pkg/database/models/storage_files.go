package models

import (
	"time"

	"github.com/gofrs/uuid/v5"
)

type StorageFiles struct {
	ID                  []uuid.UUID `sql:"primary_key" json:"id,omitempty"`
	StorageDrivesID     []uuid.UUID `json:"storage_drives_id,omitempty"`
	DirectoryGroupsID   []uuid.UUID `json:"directory_groups_id,omitempty"`
	StorageFileMimeType []string    `json:"storage_file_mime_type,omitempty"`
	OriginalName        []string    `json:"original_name,omitempty"`
	Tags                []string    `json:"tags,omitempty"`
	EditAuthorized      []bool      `json:"edit_authorized,omitempty"`
	EditUnauthorized    []bool      `json:"edit_unauthorized,omitempty"`
	ViewAuthorized      []bool      `json:"view_authorized,omitempty"`
	ViewUnauthorized    []bool      `json:"view_unauthorized,omitempty"`
	CreatedOn           []time.Time `sql:"primary_key" json:"created_on,omitempty"`
	LastUpdatedOn       []time.Time `json:"last_updated_on,omitempty"`
	DeactivatedOn       []time.Time `json:"deactivated_on,omitempty"`
}

type storageFilesTable struct {
	TableName string

	ID                  string
	StorageDrivesID     string
	DirectoryGroupsID   string
	StorageFileMimeType string
	OriginalName        string
	Tags                string
	EditAuthorized      string
	EditUnauthorized    string
	ViewAuthorized      string
	ViewUnauthorized    string
	CreatedOn           string
	LastUpdatedOn       string
	DeactivatedOn       string
	FullTextSearch      string
}

func StorageFilesTable() storageFilesTable {
	return storageFilesTable{
		TableName: "storage_files",

		ID:                  "id",
		StorageDrivesID:     "storage_drives_id",
		DirectoryGroupsID:   "directory_groups_id",
		StorageFileMimeType: "storage_file_mime_type",
		OriginalName:        "original_name",
		Tags:                "tags",
		EditAuthorized:      "edit_authorized",
		EditUnauthorized:    "edit_unauthorized",
		ViewAuthorized:      "view_authorized",
		ViewUnauthorized:    "view_unauthorized",
		CreatedOn:           "created_on",
		LastUpdatedOn:       "last_updated_on",
		DeactivatedOn:       "deactivated_on",
		FullTextSearch:      "full_text_search",
	}
}
