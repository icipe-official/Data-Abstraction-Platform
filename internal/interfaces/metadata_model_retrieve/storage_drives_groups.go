package metadatamodelretrieve

import (
	"context"
	"fmt"
	"log/slog"
	"net/http"

	intdoment "github.com/icipe-official/Data-Abstraction-Platform/internal/domain/entities"
	intlib "github.com/icipe-official/Data-Abstraction-Platform/internal/lib"
)

func (n *MetadataModelRetrieve) StorageDrivesGroupsGetMetadataModel(ctx context.Context, currentJoinDepth int, targetJoinDepth int, skipJoin map[string]bool) (map[string]any, error) {
	if iamAuthorizationRule, err := n.repo.RepoIamGroupAuthorizationsGetAuthorized(
		ctx,
		n.iamCredential,
		n.authContextDirectoryGroupID,
		[]*intdoment.IamGroupAuthorizationRule{
			{
				ID:        "",
				RuleGroup: intdoment.AUTH_RULE_GROUP_STORAGE_DRIVES,
			},
			{
				ID:        "",
				RuleGroup: intdoment.AUTH_RULE_GROUP_STORAGE_FILES,
			},
		},
		n.iamAuthorizationRules,
	); err != nil || iamAuthorizationRule == nil {
		return nil, intlib.NewError(http.StatusForbidden, http.StatusText(http.StatusForbidden))
	}

	parentMetadataModel, err := n.GetMetadataModel(intdoment.StorageDrivesGroupsRepository().RepositoryName)
	if err != nil {
		return nil, intlib.FunctionNameAndError(n.StorageDrivesGroupsGetMetadataModel, err)
	}

	parentMetadataModel, err = n.SetTableCollectionUidForMetadataModel(parentMetadataModel, currentJoinDepth)
	if err != nil {
		return nil, intlib.FunctionNameAndError(n.StorageDrivesGroupsGetMetadataModel, err)
	}

	if currentJoinDepth < targetJoinDepth || targetJoinDepth < 0 {
		if skipJoin == nil {
			skipJoin = make(map[string]bool)
		}

		if skipMMJoin, ok := skipJoin[intlib.MetadataModelGenJoinKey(intdoment.StorageDrivesGroupsRepository().StorageDrivesID, intdoment.StorageDrivesRepository().RepositoryName)]; !ok || !skipMMJoin {
			newChildMetadataModelfgSuffix := intlib.MetadataModelGenJoinKey(intdoment.StorageDrivesGroupsRepository().StorageDrivesID, intdoment.StorageDrivesRepository().RepositoryName)
			if childMetadataModel, err := n.StorageDrivesGetMetadataModel(ctx, currentJoinDepth+1, targetJoinDepth, nil); err != nil {
				n.logger.Log(ctx, slog.LevelWarn, fmt.Sprintf("setup %s failed, err: %v", newChildMetadataModelfgSuffix, err), "function", intlib.FunctionName(n.StorageDrivesGroupsGetMetadataModel))
			} else {
				parentMetadataModel, err = n.MetadataModelInsertChildIntoParent(
					parentMetadataModel,
					childMetadataModel,
					intdoment.StorageDrivesGroupsRepository().StorageDrivesID,
					false,
					newChildMetadataModelfgSuffix,
					[]string{intdoment.StorageDrivesGroupsRepository().StorageDrivesID},
				)
				if err != nil {
					return nil, intlib.FunctionNameAndError(n.StorageDrivesGroupsGetMetadataModel, err)
				}
			}
		}

		if skipMMJoin, ok := skipJoin[intlib.MetadataModelGenJoinKey(intdoment.StorageDrivesGroupsRepository().DirectoryGroupsID, intdoment.DirectoryGroupsRepository().RepositoryName)]; !ok || !skipMMJoin {
			newChildMetadataModelfgSuffix := intlib.MetadataModelGenJoinKey(intdoment.StorageDrivesGroupsRepository().DirectoryGroupsID, intdoment.DirectoryGroupsRepository().RepositoryName)
			if childMetadataModel, err := n.DirectoryGroupsGetMetadataModel(ctx, currentJoinDepth+1, targetJoinDepth, nil); err != nil {
				n.logger.Log(ctx, slog.LevelWarn, fmt.Sprintf("setup %s failed, err: %v", newChildMetadataModelfgSuffix, err), "function", intlib.FunctionName(n.StorageDrivesGroupsGetMetadataModel))
			} else {
				parentMetadataModel, err = n.MetadataModelInsertChildIntoParent(
					parentMetadataModel,
					childMetadataModel,
					intdoment.StorageDrivesGroupsRepository().DirectoryGroupsID,
					false,
					newChildMetadataModelfgSuffix,
					[]string{intdoment.StorageDrivesGroupsRepository().DirectoryGroupsID},
				)
				if err != nil {
					return nil, intlib.FunctionNameAndError(n.StorageDrivesGroupsGetMetadataModel, err)
				}
			}
		}

		if skipMMJoin, ok := skipJoin[intlib.MetadataModelGenJoinKey(intdoment.StorageDrivesGroupsRepository().RepositoryName, intdoment.StorageDrivesGroupsAuthorizationIDsRepository().RepositoryName)]; !ok || !skipMMJoin {
			newChildMetadataModelfgSuffix := intlib.MetadataModelGenJoinKey(intdoment.StorageDrivesGroupsRepository().RepositoryName, intdoment.StorageDrivesGroupsAuthorizationIDsRepository().RepositoryName)
			if childMetadataModel, err := n.DefaultAuthorizationIDsGetMetadataModel(
				ctx,
				intdoment.StorageDrivesGroupsAuthorizationIDsRepository().RepositoryName,
				currentJoinDepth+1,
				targetJoinDepth,
				nil,
				intdoment.StorageDrivesGroupsAuthorizationIDsRepository().CreationIamGroupAuthorizationsID,
				intdoment.StorageDrivesGroupsAuthorizationIDsRepository().DeactivationIamGroupAuthorizationsID,
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
