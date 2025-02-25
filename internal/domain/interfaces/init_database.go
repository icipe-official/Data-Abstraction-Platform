package interfaces

import (
	"context"

	"github.com/go-chi/httplog/v2"
	intdoment "github.com/icipe-official/Data-Abstraction-Platform/internal/domain/entities"
)

type InitDatabaseRepository interface {
	// return no of data upserted successfully.
	RepoMetadataModelDefaultsInsertMany(ctx context.Context, logger *httplog.Logger, data []intdoment.MetadataModelsDefaults) (int, error)
	// return no of data upserted successfully.
	RepoGroupAuthorizationRulesInsertMany(ctx context.Context, logger *httplog.Logger, data []intdoment.GroupAuthorizationRules) (int, error)
	// return no of data upserted successfully.
	RepoStorageTypesInsertOne(ctx context.Context, logger *httplog.Logger, data *intdoment.StorageDrivesTypes) error
	// Parameters:
	//
	// - columnfields - columns/field data to obtain. Leave empty or nil to get all columns/fields
	RepoDirectoryGroupsFindSystemGroup(ctx context.Context, logger *httplog.Logger, columnfields []string) (*intdoment.DirectoryGroups, error)
	// Parameters:
	//
	// - columnfields - columns/field data to return after insert. Leave empty or nil to return all columns/fields
	RepoDirectoryGroupsCreateSystemGroup(ctx context.Context, logger *httplog.Logger, columnfields []string) (*intdoment.DirectoryGroups, error)
}

type InitDatabaseService interface {
	// return no of data upserted successfully.
	ServiceMetadataModelDefaultsCreate(ctx context.Context, logger *httplog.Logger, data []intdoment.MetadataModelsDefaults) (int, error)
	// return no of data upserted successfully.
	ServiceGroupAuthorizationRulesCreate(ctx context.Context, logger *httplog.Logger) (int, error)
	// return no of data upserted successfully.
	ServiceStorageTypesCreate(ctx context.Context, logger *httplog.Logger) (int, error)
	ServiceInitSystemDirectoryGroup(ctx context.Context, logger *httplog.Logger) error
}
