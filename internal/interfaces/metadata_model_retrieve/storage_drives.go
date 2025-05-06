package metadatamodelretrieve

import (
	"context"
	"fmt"
	"log/slog"
	"net/http"

	intdoment "github.com/icipe-official/Data-Abstraction-Platform/internal/domain/entities"
	intlib "github.com/icipe-official/Data-Abstraction-Platform/internal/lib"
)

func (n *MetadataModelRetrieve) StorageDrivesGetMetadataModel(ctx context.Context, currentJoinDepth int, targetJoinDepth int, skipJoin map[string]bool) (map[string]any, error) {
	if iamAuthorizationRule, err := n.repo.RepoIamGroupAuthorizationsGetAuthorized(
		ctx,
		n.iamCredential,
		n.authContextDirectoryGroupID,
		[]*intdoment.IamGroupAuthorizationRule{
			{
				ID:        intdoment.AUTH_RULE_RETRIEVE,
				RuleGroup: intdoment.AUTH_RULE_GROUP_STORAGE_DRIVES,
			},
		},
		n.iamAuthorizationRules,
	); err != nil || iamAuthorizationRule == nil {
		return nil, intlib.NewError(http.StatusForbidden, http.StatusText(http.StatusForbidden))
	}

	parentMetadataModel, err := n.GetMetadataModel(intdoment.StorageDrivesRepository().RepositoryName)
	if err != nil {
		return nil, intlib.FunctionNameAndError(n.MetadataModelsGetMetadataModel, err)
	}

	parentMetadataModel, err = n.SetTableCollectionUidForMetadataModel(parentMetadataModel, currentJoinDepth)
	if err != nil {
		return nil, intlib.FunctionNameAndError(n.MetadataModelsGetMetadataModel, err)
	}

	if currentJoinDepth < targetJoinDepth || targetJoinDepth < 0 {
		if skipJoin == nil {
			skipJoin = make(map[string]bool)
		}

		if skipMMJoin, ok := skipJoin[intlib.MetadataModelGenJoinKey(intdoment.StorageDrivesRepository().StorageDrivesTypesID, intdoment.StorageDrivesTypesRepository().RepositoryName)]; !ok || !skipMMJoin {
			newChildMetadataModelfgSuffix := intlib.MetadataModelGenJoinKey(intdoment.StorageDrivesRepository().StorageDrivesTypesID, intdoment.StorageDrivesTypesRepository().RepositoryName)
			if childMetadataModel, err := n.StorageDrivesTypesGetMetadataModel(ctx, currentJoinDepth+1); err != nil {
				n.logger.Log(ctx, slog.LevelWarn, fmt.Sprintf("setup %s failed, err: %v", newChildMetadataModelfgSuffix, err), "function", intlib.FunctionName(n.MetadataModelsGetMetadataModel))
			} else {
				parentMetadataModel, err = n.MetadataModelInsertChildIntoParent(
					parentMetadataModel,
					childMetadataModel,
					intdoment.StorageDrivesRepository().StorageDrivesTypesID,
					false,
					newChildMetadataModelfgSuffix,
					[]string{intdoment.StorageDrivesRepository().StorageDrivesTypesID},
				)
				if err != nil {
					return nil, intlib.FunctionNameAndError(n.MetadataModelsGetMetadataModel, err)
				}
			}
		}

		if skipMMJoin, ok := skipJoin[intlib.MetadataModelGenJoinKey(intdoment.StorageDrivesRepository().RepositoryName, intdoment.StorageDrivesAuthorizationIDsRepository().RepositoryName)]; !ok || !skipMMJoin {
			newChildMetadataModelfgSuffix := intlib.MetadataModelGenJoinKey(intdoment.StorageDrivesRepository().RepositoryName, intdoment.StorageDrivesAuthorizationIDsRepository().RepositoryName)
			if childMetadataModel, err := n.DefaultAuthorizationIDsGetMetadataModel(
				ctx,
				intdoment.StorageDrivesAuthorizationIDsRepository().RepositoryName,
				currentJoinDepth+1,
				targetJoinDepth,
				nil,
				intdoment.StorageDrivesAuthorizationIDsRepository().CreationIamGroupAuthorizationsID,
				intdoment.StorageDrivesAuthorizationIDsRepository().DeactivationIamGroupAuthorizationsID,
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
