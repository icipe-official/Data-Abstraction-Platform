package interfaces

import (
	"context"

	"github.com/gofrs/uuid/v5"
	intdoment "github.com/icipe-official/Data-Abstraction-Platform/internal/domain/entities"
)

type Iam interface {
	RepoIamAuthorizationRulesGetAuthorized(ctx context.Context, iamAuthInfo *intdoment.IamAuthInfo, authContextDirectoryGroupID uuid.UUID, groupAuthorizationRules []*intdoment.GroupAuthorizationRules, currentIamAuthorizationRules *intdoment.IamAuthorizationRules) ([]intdoment.IamAuthorizationRule, error)
}
