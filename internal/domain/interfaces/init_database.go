package interfaces

import (
	"context"

	intdoment "github.com/icipe-official/Data-Abstraction-Platform/internal/domain/entities"
)

type InitDatabaseRepository interface {
	// return no of data upserted successfully.
	RepoMetadataModelDefaultsInsertMany(ctx context.Context, data []intdoment.MetadataModelsDefaults) (int, error)
	// return no of data upserted successfully.
	RepoGroupAuthorizationRulesInsertMany(ctx context.Context, data []intdoment.GroupAuthorizationRules) (int, error)
	// return no of data upserted successfully.
	RepoStorageTypesInsertOne(ctx context.Context, data *intdoment.StorageDrivesTypes) error
}

type InitDatabaseService interface {
	// return no of data upserted successfully.
	ServiceMetadataModelDefaultsCreate(ctx context.Context, data []intdoment.MetadataModelsDefaults) (int, error)
	// return no of data upserted successfully.
	ServiceGroupAuthorizationRulesCreate(ctx context.Context) (int, error)
	// return no of data upserted successfully.
	ServiceStorageTypesCreate(ctx context.Context) (int, error)
}
