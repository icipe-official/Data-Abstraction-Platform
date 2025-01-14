package models

import (
	"github.com/gofrs/uuid/v5"
)

type MetadataModelsDefaults struct {
	ID               []string    `json:"id,omitempty"`
	Description      []string    `json:"description,omitempty"`
	MetadataModelsID []uuid.UUID `json:"metadata_models_id,omitempty"`
}

type metadataModelsDefaultsTable struct {
	TableName string

	ID               string
	Description      string
	MetadataModelsID string
}

func MetadataModelsDefaultsTable() metadataModelsDefaultsTable {
	return metadataModelsDefaultsTable{
		TableName: "metadata_models_defaults",

		ID:               "id",
		Description:      "description",
		MetadataModelsID: "metadata_models_id",
	}
}
