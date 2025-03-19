package interfaces

import (
	"context"

	"github.com/gofrs/uuid/v5"
	intdoment "github.com/icipe-official/Data-Abstraction-Platform/internal/domain/entities"
)

type RouteStorageDrivesGroupsRepository interface {
	RepoStorageDrivesGroupsSearch(
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
	RepoIamGroupAuthorizationsGetAuthorized(
		ctx context.Context,
		iamAuthInfo *intdoment.IamCredentials,
		authContextDirectoryGroupID uuid.UUID,
		groupAuthorizationRules []*intdoment.IamGroupAuthorizationRule,
		currentIamAuthorizationRules *intdoment.IamAuthorizationRules,
	) ([]*intdoment.IamAuthorizationRule, error)
	RepoDirectoryGroupsFindOneByIamCredentialID(ctx context.Context, iamCredentialID uuid.UUID, columns []string) (*intdoment.DirectoryGroups, error)
	RepoDirectoryGroupsFindSystemGroup(ctx context.Context, columns []string) (*intdoment.DirectoryGroups, error)
	RepoStorageDrivesGroupsDeleteOne(ctx context.Context, iamAuthorizationRule *intdoment.IamAuthorizationRule, datum *intdoment.StorageDrivesGroups) error
	RepoStorageDrivesGroupsUpdateOne(ctx context.Context, datum *intdoment.StorageDrivesGroups) error
	RepoStorageDrivesGroupsInsertOne(
		ctx context.Context,
		iamAuthorizationRule *intdoment.IamAuthorizationRule,
		datum *intdoment.StorageDrivesGroups,
		columns []string,
	) (*intdoment.StorageDrivesGroups, error)
}

type RouteStorageDrivesGroupsWebsiteService interface {
	ServiceGetStorageDriveGroupPageHtml(
		ctx context.Context,
		websiteTemplate WebsiteTemplates,
		openid OpenID,
		partialRequest bool,
		partialName string,
		iamCredential *intdoment.IamCredentials,
		authContextDirectoryGroupID uuid.UUID,
		data any,
	) (*string, error)
	ServiceStorageDrivesGroupsSearch(
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
	ServiceStorageDrivesGroupsGetMetadataModel(ctx context.Context, metadataModelRetrieve MetadataModelRetrieve, targetJoinDepth int) (map[string]any, error)
	ServiceIamGroupAuthorizationsGetAuthorized(
		ctx context.Context,
		iamAuthInfo *intdoment.IamCredentials,
		authContextDirectoryGroupID uuid.UUID,
		groupAuthorizationRules []*intdoment.IamGroupAuthorizationRule,
		currentIamAuthorizationRules *intdoment.IamAuthorizationRules,
	) ([]*intdoment.IamAuthorizationRule, error)
	ServiceGetStorageDrivesGroupsPageHtml(
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

type RouteStorageDrivesGroupsApiCoreService interface {
	ServiceStorageDrivesGroupsDeleteMany(
		ctx context.Context,
		iamCredential *intdoment.IamCredentials,
		iamAuthorizationRules *intdoment.IamAuthorizationRules,
		authContextDirectoryGroupID uuid.UUID,
		verboseResponse bool,
		data []*intdoment.StorageDrivesGroups,
	) (int, *intdoment.MetadataModelVerbRes, error)
	ServiceStorageDrivesGroupsUpdateMany(
		ctx context.Context,
		iamCredential *intdoment.IamCredentials,
		iamAuthorizationRules *intdoment.IamAuthorizationRules,
		authContextDirectoryGroupID uuid.UUID,
		verboseResponse bool,
		data []*intdoment.StorageDrivesGroups,
	) (int, *intdoment.MetadataModelVerbRes, error)
	ServiceStorageDrivesGroupsInsertMany(
		ctx context.Context,
		iamCredential *intdoment.IamCredentials,
		iamAuthorizationRules *intdoment.IamAuthorizationRules,
		authContextDirectoryGroupID uuid.UUID,
		verboseResponse bool,
		data []*intdoment.StorageDrivesGroups,
	) (int, *intdoment.MetadataModelVerbRes, error)
	ServiceStorageDrivesGroupsSearch(
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
	ServiceStorageDrivesGroupsGetMetadataModel(ctx context.Context, metadataModelRetrieve MetadataModelRetrieve, targetJoinDepth int) (map[string]any, error)
	ServiceDirectoryGroupsFindOneByIamCredentialID(ctx context.Context, iamCredentialID uuid.UUID) (*intdoment.DirectoryGroups, error)
}
