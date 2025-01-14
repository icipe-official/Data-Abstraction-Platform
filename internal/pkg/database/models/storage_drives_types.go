package models

type StorageDrivesTypes struct {
	ID          []string `sql:"primary_key" json:"id,omitempty"`
	Description []string `json:"description,omitempty"`
}

type storageDrivesTypesTable struct {
	TableName string

	ID               string
	Description      string
	StorageDriveType string
}

func StorageDrivesTypesTable() storageDrivesTypesTable {
	return storageDrivesTypesTable{
		TableName: "storage_drives_types",

		ID:          "id",
		Description: "description",
	}
}
