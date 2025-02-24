package entities

import (
	"github.com/gofrs/uuid/v5"
)

type MetadataModelsDefaults struct {
	ID               []string    `json:"id,omitempty"`
	Description      []string    `json:"description,omitempty"`
	MetadataModelsID []uuid.UUID `json:"metadata_models_id,omitempty"`
}

type metadataModelsDefaultsRepository struct {
	RepositoryName string

	ID               string
	Description      string
	MetadataModelsID string
}

func MetadataModelsDefaultsRepository() metadataModelsDefaultsRepository {
	return metadataModelsDefaultsRepository{
		RepositoryName: "metadata_models_defaults",

		ID:               "id",
		Description:      "description",
		MetadataModelsID: "metadata_models_id",
	}
}

const (
	METADATA_MODELS_DEFAULTS_DIRECTORY       string = "directory"
	METADATA_MODELS_DEFAULTS_DIRECTORY_GROUP string = "directory_group"
)

func AllMetadataModelsDefaults() []MetadataModelsDefaults {
	return []MetadataModelsDefaults{
		{
			ID:          []string{"directory"},
			Description: []string{"Default metadata-model for directory"},
		},
		{
			ID:          []string{"directory_group"},
			Description: []string{"Default metadata-model for directory_group"},
		},
	}
}
