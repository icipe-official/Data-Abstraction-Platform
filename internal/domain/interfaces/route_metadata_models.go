package interfaces

import (
	"context"

	"github.com/gofrs/uuid/v5"
	intdoment "github.com/icipe-official/Data-Abstraction-Platform/internal/domain/entities"
)

type RouteMetadataModelsRepository interface {
	RepoDirectoryGroupsFindSystemGroup(ctx context.Context, columns []string) (*intdoment.DirectoryGroups, error)
	RepoDirectoryGroupsFindOneByIamCredentialID(ctx context.Context, iamCredentialID uuid.UUID, columns []string) (*intdoment.DirectoryGroups, error)
	RepoMetadataModelsSearch(
		ctx context.Context,
		mmsearch *intdoment.MetadataModelSearch,
		repo IamRepository,
		iamCredential *intdoment.IamCredentials,
		iamAuthorizationRules *intdoment.IamAuthorizationRules,
		startSearchDirectoryGroupID uuid.UUID,
		authContextDirectoryGroupID uuid.UUID,
		skipIfFGDisabled bool,
		skipIfDataExtraction bool,
		whereAfterJoin bool,
	) (*intdoment.MetadataModelSearchResults, error)
}

type RouteMetadataModelsApiService interface {
	ServiceMetadataModelsSearch(
		ctx context.Context,
		mmsearch *intdoment.MetadataModelSearch,
		repo IamRepository,
		iamCredential *intdoment.IamCredentials,
		iamAuthorizationRules *intdoment.IamAuthorizationRules,
		startSearchDirectoryGroupID uuid.UUID,
		authContextDirectoryGroupID uuid.UUID,
		skipIfFGDisabled bool,
		skipIfDataExtraction bool,
		whereAfterJoin bool,
	) (*intdoment.MetadataModelSearchResults, error)
	ServiceMetadataModelsGetMetadataModel(ctx context.Context, metadataModelRetrieve MetadataModelRetrieve, targetJoinDepth int) (map[string]any, error)
	ServiceDirectoryGroupsFindOneByIamCredentialID(ctx context.Context, iamCredentialID uuid.UUID) (*intdoment.DirectoryGroups, error)
}

type RouteMetadataModelsWebsiteService interface {
	ServiceGetMedataModelsPageHtml(
		ctx context.Context,
		websiteTemplate WebsiteTemplates,
		openid OpenID,
		partialRequest bool,
		partialName string,
		iamCredential *intdoment.IamCredentials,
		authContextDirectoryGroupID uuid.UUID,
		data any,
	) (*string, error)
	ServiceGetMedataModelPageHtml(
		ctx context.Context,
		websiteTemplate WebsiteTemplates,
		openid OpenID,
		partialRequest bool,
		partialName string,
		iamCredential *intdoment.IamCredentials,
		authContextDirectoryGroupID uuid.UUID,
		data any,
	) (*string, error)
	ServiceDirectoryGroupsFindOneByIamCredentialID(ctx context.Context, iamCredentialID uuid.UUID) (*intdoment.DirectoryGroups, error)
}
