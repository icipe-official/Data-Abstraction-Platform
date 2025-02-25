package interfaces

import (
	"context"

	"github.com/go-chi/httplog/v2"
	intdoment "github.com/icipe-official/Data-Abstraction-Platform/internal/domain/entities"
)

type CreateSuperUserRepository interface {
	// Will return error if more than one row is returned.
	// Parameters:
	//
	// - columnfields - columns/field data to obtain. Leave empty or nil to get all columns/fields
	RepoIamCredentialsFindOneByID(ctx context.Context, logger *httplog.Logger, columnField string, value any, columnfields []string) (*intdoment.IamCredentials, error)
	// Parameters:
	//
	// - columnfields - columns/field data to obtain. Leave empty or nil to get all columns/fields
	RepoDirectoryGroupsFindSystemGroup(ctx context.Context, logger *httplog.Logger, columnfields []string) (*intdoment.DirectoryGroups, error)
	RepoDirectoryGroupsFindSystemGroupRuleAuthorizations(ctx context.Context, logger *httplog.Logger) ([]intdoment.GroupRuleAuthorization, error)
}

type CreateSuperUserService interface {
	ServiceGetIamCredentials(ctx context.Context, logger *httplog.Logger) (*intdoment.IamCredentials, error)
	ServiceAssignSystemRolesToIamCredential(ctx context.Context, logger *httplog.Logger, iamCredential *intdoment.IamCredentials) error
}
