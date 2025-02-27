package interfaces

import (
	"context"

	intdoment "github.com/icipe-official/Data-Abstraction-Platform/internal/domain/entities"
)

type RouteHomeRepository interface {
	RepoIamCredentialsFindOneByID(ctx context.Context, columnField string, value any, columnfields []string) (*intdoment.IamCredentials, error)
	RepoIamCredentialsInsertOpenIDUserInfo(ctx context.Context, openIDUserInfo *intdoment.OpenIDUserInfo, columnfields []string) (*intdoment.IamCredentials, error)
}

type RouteHomeApiService interface {
}

type RouteHomeWebsiteService interface {
	ServiceOpenIDRevokeToken(ctx context.Context, openid OpenID, token *intdoment.OpenIDToken) error
	ServiceGetOpenIDToken(ctx context.Context, openid OpenID, redirectParams *intdoment.OpenIDRedirectParams) (*intdoment.OpenIDToken, error)
	ServiceGetOpenIDUserInfo(ctx context.Context, openid OpenID, token *intdoment.OpenIDToken) (*intdoment.OpenIDUserInfo, error)
	ServiceGetIamCredentialsByOpenIDSub(ctx context.Context, openIDUserInfo *intdoment.OpenIDUserInfo) (*intdoment.IamCredentials, error)
	ServiceGetHomePageHtml(ctx context.Context, websiteTemplate WebsiteTemplates, openid OpenID, partialRequest bool, partialName string) (*string, error)
}
