package metadatamodelretrieve

import (
	"context"
	"net/http"

	intdoment "github.com/icipe-official/Data-Abstraction-Platform/internal/domain/entities"
	intlib "github.com/icipe-official/Data-Abstraction-Platform/internal/lib"
)

func (n *MetadataModelRetrieve) GroupAuthorizationRulesGetMetadataModel(ctx context.Context, currentJoinDepth int) (map[string]any, error) {
	if iamAuthorizationRule, err := n.repo.RepoIamGroupAuthorizationsGetAuthorized(
		ctx,
		n.iamCredential,
		n.authContextDirectoryGroupID,
		[]*intdoment.IamGroupAuthorizationRule{
			{
				ID:        "",
				RuleGroup: intdoment.AUTH_RULE_GROUP_GROUP_RULE_AUTHORIZATIONS,
			},
		},
		n.iamAuthorizationRules,
	); err != nil || iamAuthorizationRule == nil {
		return nil, intlib.NewError(http.StatusForbidden, http.StatusText(http.StatusForbidden))
	}

	parentMetadataModel, err := n.GetMetadataModel(intdoment.GroupAuthorizationRulesRepository().RepositoryName)
	if err != nil {
		return nil, intlib.FunctionNameAndError(n.GroupAuthorizationRulesGetMetadataModel, err)
	}

	parentMetadataModel, err = n.SetTableCollectionUidForMetadataModel(parentMetadataModel, currentJoinDepth)
	if err != nil {
		return nil, intlib.FunctionNameAndError(n.GroupAuthorizationRulesGetMetadataModel, err)
	}

	return parentMetadataModel, nil
}
