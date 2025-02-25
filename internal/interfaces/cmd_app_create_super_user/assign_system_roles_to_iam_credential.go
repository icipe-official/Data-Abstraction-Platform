package cmdappcreatesuperuser

import (
	"context"

	"github.com/go-chi/httplog/v2"
	intdoment "github.com/icipe-official/Data-Abstraction-Platform/internal/domain/entities"
	intlib "github.com/icipe-official/Data-Abstraction-Platform/internal/lib"
)

func (n *CmdCreateSuperUserService) ServiceAssignSystemRolesToIamCredential(ctx context.Context, logger *httplog.Logger, iamCredential *intdoment.IamCredentials) error {
	systemGroupRoles, err := n.repo.RepoDirectoryGroupsFindSystemGroupRuleAuthorizations(ctx, logger)
	if err != nil {
		return intlib.FunctionNameAndError(n.ServiceAssignSystemRolesToIamCredential, err)
	}
}
