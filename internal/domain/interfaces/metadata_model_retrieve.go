package interfaces

import "context"

type MetadataModelRetrieve interface {
	GetMetadataModel(tableCollectionName string) (map[string]any, error)
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
}
