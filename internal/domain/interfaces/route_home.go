package interfaces

import (
	"context"

	"github.com/gofrs/uuid/v5"
	intdoment "github.com/icipe-official/Data-Abstraction-Platform/internal/domain/entities"
)

type RouteHomeRepository interface {
	RepoDirectoryGroupsFindSystemGroup(ctx context.Context, columns []string) (*intdoment.DirectoryGroups, error)
	RepoIamCredentialsFindOneByID(ctx context.Context, columnField string, value any, columnfields []string) (*intdoment.IamCredentials, error)
	RepoIamCredentialsInsertOpenIDUserInfo(ctx context.Context, openIDUserInfo *intdoment.OpenIDUserInfo, columnfields []string) (*intdoment.IamCredentials, error)
	RepoDirectoryGroupsFindOneByIamCredentialID(ctx context.Context, iamCredentialID uuid.UUID, columns []string) (*intdoment.DirectoryGroups, error)
	RepoDirectoryGroupsSearch(
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

type RouteHomeWebsiteService interface {
	ServiceDirectoryGroupsSearch(
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
	ServiceDirectoryGroupsGetMetadataModel(ctx context.Context, metadataModelRetrieve MetadataModelRetrieve, targetJoinDepth int) (map[string]any, error)
	ServiceOpenIDRevokeToken(ctx context.Context, openid OpenID, token *intdoment.OpenIDToken) error
	ServiceGetOpenIDToken(ctx context.Context, openid OpenID, redirectParams *intdoment.OpenIDRedirectParams) (*intdoment.OpenIDToken, error)
	ServiceGetOpenIDUserInfo(ctx context.Context, openid OpenID, token *intdoment.OpenIDToken) (*intdoment.OpenIDUserInfo, error)
	ServiceGetIamCredentialsByOpenIDSub(ctx context.Context, openIDUserInfo *intdoment.OpenIDUserInfo) (*intdoment.IamCredentials, error)
	ServiceGetDirectoryGroupHomePageHmtl(
		ctx context.Context,
		websiteTemplate WebsiteTemplates,
		openid OpenID,
		partialRequest bool,
		partialName string,
		iamCredential *intdoment.IamCredentials,
		authContextDirectoryGroupID uuid.UUID,
		data any,
	) (*string, error)
	ServiceGetHomePageHtml(
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
