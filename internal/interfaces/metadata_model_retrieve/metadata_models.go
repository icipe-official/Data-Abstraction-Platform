package metadatamodelretrieve

import (
	"context"
	"fmt"
	"log/slog"
	"net/http"

	intdoment "github.com/icipe-official/Data-Abstraction-Platform/internal/domain/entities"
	intlib "github.com/icipe-official/Data-Abstraction-Platform/internal/lib"
)

func (n *MetadataModelRetrieve) MetadataModelsGetMetadataModel(ctx context.Context, currentJoinDepth int, targetJoinDepth int, skipJoin map[string]bool) (map[string]any, error) {
	if iamAuthorizationRule, err := n.repo.RepoIamGroupAuthorizationsGetAuthorized(
		ctx,
		n.iamCredential,
		n.authContextDirectoryGroupID,
		[]*intdoment.IamGroupAuthorizationRule{
			{
				ID:        intdoment.AUTH_RULE_RETRIEVE_SELF,
				RuleGroup: intdoment.AUTH_RULE_GROUP_METADATA_MODELS,
			},
			{
				ID:        intdoment.AUTH_RULE_RETRIEVE,
				RuleGroup: intdoment.AUTH_RULE_GROUP_METADATA_MODELS,
			},
			{
				ID:        intdoment.AUTH_RULE_RETRIEVE_OTHERS,
				RuleGroup: intdoment.AUTH_RULE_GROUP_METADATA_MODELS,
			},
		},
		n.iamAuthorizationRules,
	); err != nil || iamAuthorizationRule == nil {
		return nil, intlib.NewError(http.StatusForbidden, http.StatusText(http.StatusForbidden))
	}

	parentMetadataModel, err := n.GetMetadataModel(intdoment.MetadataModelsRepository().RepositoryName)
	if err != nil {
		return nil, intlib.FunctionNameAndError(n.MetadataModelsGetMetadataModel, err)
	}

	parentMetadataModel, err = n.SetTableCollectionUidForMetadataModel(parentMetadataModel)
	if err != nil {
		return nil, intlib.FunctionNameAndError(n.MetadataModelsGetMetadataModel, err)
	}

	if currentJoinDepth < targetJoinDepth || targetJoinDepth < 0 {
		if skipJoin == nil {
			skipJoin = make(map[string]bool)
		}

		if skipMMJoin, ok := skipJoin[intlib.MetadataModelGenJoinKey(intdoment.MetadataModelsRepository().DirectoryGroupsID, intdoment.DirectoryGroupsRepository().RepositoryName)]; !ok || !skipMMJoin {
			newChildMetadataModelfgSuffix := intlib.MetadataModelGenJoinKey(intdoment.MetadataModelsRepository().DirectoryGroupsID, intdoment.DirectoryGroupsRepository().RepositoryName)
			if childMetadataModel, err := n.DirectoryGroupsGetMetadataModel(
				ctx,
				currentJoinDepth+1,
				targetJoinDepth,
				nil,
			); err != nil {
				n.logger.Log(ctx, slog.LevelWarn, fmt.Sprintf("setup %s failed, err: %v", newChildMetadataModelfgSuffix, err), "function", intlib.FunctionName(n.MetadataModelsGetMetadataModel))
			} else {
				parentMetadataModel, err = n.MetadataModelInsertChildIntoParent(
					parentMetadataModel,
					childMetadataModel,
					intdoment.MetadataModelsRepository().DirectoryGroupsID,
					false,
					newChildMetadataModelfgSuffix,
					[]string{intdoment.MetadataModelsRepository().DirectoryGroupsID},
				)
				if err != nil {
					return nil, intlib.FunctionNameAndError(n.MetadataModelsGetMetadataModel, err)
				}
			}
		}

		if skipMMJoin, ok := skipJoin[intlib.MetadataModelGenJoinKey(intdoment.MetadataModelsRepository().RepositoryName, intdoment.MetadataModelsAuthorizationIDsRepository().RepositoryName)]; !ok || !skipMMJoin {
			newChildMetadataModelfgSuffix := intlib.MetadataModelGenJoinKey(intdoment.MetadataModelsRepository().RepositoryName, intdoment.MetadataModelsAuthorizationIDsRepository().RepositoryName)
			if childMetadataModel, err := n.DefaultAuthorizationIDsGetMetadataModel(
				ctx,
				intdoment.MetadataModelsAuthorizationIDsRepository().RepositoryName,
				currentJoinDepth+1,
				targetJoinDepth,
				nil,
				intdoment.MetadataModelsAuthorizationIDsRepository().CreationIamGroupAuthorizationsID,
				intdoment.MetadataModelsAuthorizationIDsRepository().DeactivationIamGroupAuthorizationsID,
			); err != nil {
				n.logger.Log(ctx, slog.LevelWarn, fmt.Sprintf("setup %s failed, err: %v", newChildMetadataModelfgSuffix, err), "function", intlib.FunctionName(n.DirectoryGroupsGetMetadataModel))
			} else {
				parentMetadataModel, err = n.MetadataModelInsertChildIntoParent(parentMetadataModel, childMetadataModel, "", false, newChildMetadataModelfgSuffix, nil)
				if err != nil {
					return nil, intlib.FunctionNameAndError(n.DirectoryGroupsGetMetadataModel, err)
				}
			}
		}
	}

	return parentMetadataModel, nil
}
