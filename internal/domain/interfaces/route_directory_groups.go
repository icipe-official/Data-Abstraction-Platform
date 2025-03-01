package interfaces

import (
	"context"

	"github.com/gofrs/uuid/v5"
	intdoment "github.com/icipe-official/Data-Abstraction-Platform/internal/domain/entities"
)

type RouteDirectoryGroupsRepository interface {
	RepoDirectoryGroupsFindSystemGroup(ctx context.Context, columns []string) (*intdoment.DirectoryGroups, error)
	RepoDirectoryGroupsFindOneByIamCredentialID(ctx context.Context, iamCredentialID uuid.UUID, columns []string) (*intdoment.DirectoryGroups, error)
}

type RouteDirectoryGroupsApiCoreService interface {
	ServiceGetDirectoryGroupsMetadataModel(ctx context.Context, metadataModelRetrieve MetadataModelRetrieve, targetJoinDepth int) (map[string]any, error)
	ServiceDirectoryGroupsFindOneByIamCredentialID(ctx context.Context, iamCredentialID uuid.UUID) (*intdoment.DirectoryGroups, error)
}
