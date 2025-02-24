package entities

import (
	"time"

	"github.com/gofrs/uuid/v5"
)

type StorageDrives struct {
	ID                  []uuid.UUID `json:"id,omitempty"`
	StorageDriveTypesID []string    `json:"storage_drive_types_id,omitempty"`
	Description         []string    `json:"description,omitempty"`
	Data                []any       `json:"data,omitempty"`
	CreatedOn           []time.Time `json:"created_on,omitempty"`
	LastUpdatedOn       []time.Time `json:"last_updated_on,omitempty"`
	DeactivatedOn       []time.Time `json:"deactivated_on,omitempty"`
}

type storageDrivesRepository struct {
	RepositoryName string

	ID                  string
	StorageDriveTypesID string
	Description         string
	Data                string
	CreatedOn           string
	LastUpdatedOn       string
	DeactivatedOn       string
}

func StorageDrivesRepository() storageDrivesRepository {
	return storageDrivesRepository{
		RepositoryName: "storage_drives",

		ID:                  "id",
		StorageDriveTypesID: "storage_drive_types_id",
		Description:         "description",
		Data:                "data",
		CreatedOn:           "created_on",
		LastUpdatedOn:       "last_updated_on",
		DeactivatedOn:       "deactivated_on",
	}
}
