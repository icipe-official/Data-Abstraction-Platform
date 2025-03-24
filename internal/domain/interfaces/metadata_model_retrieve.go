package interfaces

import "context"

type MetadataModelRetrieve interface {
	AbstractionsDirectoryGroupsGetMetadataModel(ctx context.Context, currentJoinDepth int, targetJoinDepth int, skipJoin map[string]bool) (map[string]any, error)
	StorageFilesGetMetadataModel(ctx context.Context, currentJoinDepth int, targetJoinDepth int, skipJoin map[string]bool) (map[string]any, error)
	StorageDrivesGroupsGetMetadataModel(ctx context.Context, currentJoinDepth int, targetJoinDepth int, skipJoin map[string]bool) (map[string]any, error)
	StorageDrivesTypesGetMetadataModel(ctx context.Context) (map[string]any, error)
	StorageDrivesGetMetadataModel(ctx context.Context, currentJoinDepth int, targetJoinDepth int, skipJoin map[string]bool) (map[string]any, error)
	GetMetadataModel(tableCollectionName string) (map[string]any, error)
	GetStorageDriveTypeMetadataModel(storageDriveTypeID string) (map[string]any, error)
	DefaultAuthorizationIDsGetMetadataModel(
		ctx context.Context,
		tableCollectionName string,
		currentJoinDepth int,
		targetJoinDepth int,
		skipJoin map[string]bool,
		creationIamGroupAuthorizationsIDColumnName string,
		deactivationIamGroupAuthorizationsIDColumnName string,
	) (map[string]any, error)
	DirectoryGroupsGetMetadataModel(ctx context.Context, currentJoinDepth int, targetJoinDepth int, skipJoin map[string]bool) (map[string]any, error)
	DirectoryGetMetadataModel(ctx context.Context, currentJoinDepth int, targetJoinDepth int, skipJoin map[string]bool) (map[string]any, error)
	GroupAuthorizationRulesGetMetadataModel(ctx context.Context) (map[string]any, error)
	GroupRuleAuthorizationsGetMetadataModel(ctx context.Context, currentJoinDepth int, targetJoinDepth int, skipJoin map[string]bool) (map[string]any, error)
	IamCredentialsGetMetadataModel(ctx context.Context, currentJoinDepth int, targetJoinDepth int, skipJoin map[string]bool) (map[string]any, error)
	IamGroupAuthorizationsGetMetadataModel(ctx context.Context, currentJoinDepth int, targetJoinDepth int, skipJoin map[string]bool) (map[string]any, error)
	MetadataModelsGetMetadataModel(ctx context.Context, currentJoinDepth int, targetJoinDepth int, skipJoin map[string]bool) (map[string]any, error)
	MetadataModelsDirectoryGetMetadataModel(ctx context.Context, currentJoinDepth int, targetJoinDepth int, skipJoin map[string]bool) (map[string]any, error)
	MetadataModelsDirectoryGroupsGetMetadataModel(ctx context.Context, currentJoinDepth int, targetJoinDepth int, skipJoin map[string]bool) (map[string]any, error)
}
