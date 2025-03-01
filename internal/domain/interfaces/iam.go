package interfaces

import (
	"context"

	"github.com/gofrs/uuid/v5"
	intdoment "github.com/icipe-official/Data-Abstraction-Platform/internal/domain/entities"
)

type IamRepository interface {
	// Will return error if more than one row is returned.
	// Parameters:
	//
	// - columnfields - columns/field data to obtain. Leave empty or nil to get all columns/fields
	RepoIamCredentialsFindOneByID(ctx context.Context, columnField string, value any, columnfields []string) (*intdoment.IamCredentials, error)
	RepoIamGroupAuthorizationsGetAuthorized(ctx context.Context, iamAuthInfo *intdoment.IamCredentials, authContextDirectoryGroupID uuid.UUID, groupAuthorizationRules []*intdoment.IamGroupAuthorizationRule, currentIamAuthorizationRules *intdoment.IamAuthorizationRules) ([]*intdoment.IamAuthorizationRule, error)
}

type RouteIamRepository interface {
	// Will return error if more than one row is returned.
	// Parameters:
	//
	// - columnfields - columns/field data to obtain. Leave empty or nil to get all columns/fields
	RepoIamCredentialsFindOneByID(ctx context.Context, columnField string, value any, columnfields []string) (*intdoment.IamCredentials, error)
}

type RouteIamService interface {
	ServiceOpenIDRevokeToken(ctx context.Context, openid OpenID, token *intdoment.OpenIDToken) error
	ServiceOpenIDIntrospectToken(ctx context.Context, openid OpenID, openIDToken *intdoment.OpenIDToken) (*intdoment.OpenIDTokenIntrospect, error)
	ServiceGetIamCredentialsByOpenIDSub(ctx context.Context, openIDTokenIntrospect *intdoment.OpenIDTokenIntrospect) (*intdoment.IamCredentials, error)
}
