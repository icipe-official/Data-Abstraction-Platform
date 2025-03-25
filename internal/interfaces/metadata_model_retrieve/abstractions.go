package metadatamodelretrieve

import (
	"context"
	"fmt"
	"log/slog"

	intdoment "github.com/icipe-official/Data-Abstraction-Platform/internal/domain/entities"
	intlib "github.com/icipe-official/Data-Abstraction-Platform/internal/lib"
)

func (n *MetadataModelRetrieve) AbstractionsGetMetadataModel(ctx context.Context, currentJoinDepth int, targetJoinDepth int, skipJoin map[string]bool) (map[string]any, error) {
	// if iamAuthorizationRule, err := n.repo.RepoIamGroupAuthorizationsGetAuthorized(
	// 	ctx,
	// 	n.iamCredential,
	// 	n.authContextDirectoryGroupID,
	// 	[]*intdoment.IamGroupAuthorizationRule{
	// 		{
	// 			ID:        intdoment.AUTH_RULE_RETRIEVE,
	// 			RuleGroup: intdoment.AUTH_RULE_GROUP_ABSTRACTIONS,
	// 		},
	// 		{
	// 			ID:        intdoment.AUTH_RULE_RETRIEVE_OTHERS,
	// 			RuleGroup: intdoment.AUTH_RULE_GROUP_ABSTRACTIONS,
	// 		},
	// 	},
	// 	n.iamAuthorizationRules,
	// ); err != nil || iamAuthorizationRule == nil {
	// 	return nil, intlib.NewError(http.StatusForbidden, http.StatusText(http.StatusForbidden))
	// }

	parentMetadataModel, err := n.GetMetadataModel(intdoment.AbstractionsRepository().RepositoryName)
	if err != nil {
		return nil, intlib.FunctionNameAndError(n.AbstractionsGetMetadataModel, err)
	}

	parentMetadataModel, err = n.SetTableCollectionUidForMetadataModel(parentMetadataModel)
	if err != nil {
		return nil, intlib.FunctionNameAndError(n.AbstractionsGetMetadataModel, err)
	}

	if currentJoinDepth < targetJoinDepth || targetJoinDepth < 0 {
		if skipJoin == nil {
			skipJoin = make(map[string]bool)
		}

		if skipMMJoin, ok := skipJoin[intlib.MetadataModelGenJoinKey(intdoment.AbstractionsRepository().DirectoryGroupsID, intdoment.AbstractionsDirectoryGroupsRepository().RepositoryName)]; !ok || !skipMMJoin {
			newChildMetadataModelfgSuffix := intlib.MetadataModelGenJoinKey(intdoment.AbstractionsRepository().DirectoryGroupsID, intdoment.AbstractionsDirectoryGroupsRepository().RepositoryName)
			if childMetadataModel, err := n.AbstractionsDirectoryGroupsGetMetadataModel(
				ctx,
				currentJoinDepth+1,
				targetJoinDepth,
				nil,
			); err != nil {
				n.logger.Log(ctx, slog.LevelWarn, fmt.Sprintf("setup %s failed, err: %v", newChildMetadataModelfgSuffix, err), "function", intlib.FunctionName(n.AbstractionsGetMetadataModel))
			} else {
				parentMetadataModel, err = n.MetadataModelInsertChildIntoParent(
					parentMetadataModel,
					childMetadataModel,
					intdoment.AbstractionsRepository().DirectoryGroupsID,
					false,
					newChildMetadataModelfgSuffix,
					[]string{intdoment.AbstractionsRepository().DirectoryGroupsID},
				)
				if err != nil {
					return nil, intlib.FunctionNameAndError(n.AbstractionsGetMetadataModel, err)
				}
			}
		}

		if skipMMJoin, ok := skipJoin[intlib.MetadataModelGenJoinKey(intdoment.AbstractionsRepository().DirectoryID, intdoment.DirectoryRepository().RepositoryName)]; !ok || !skipMMJoin {
			newChildMetadataModelfgSuffix := intlib.MetadataModelGenJoinKey(intdoment.AbstractionsRepository().DirectoryID, intdoment.DirectoryRepository().RepositoryName)
			if childMetadataModel, err := n.DirectoryGetMetadataModel(
				ctx,
				currentJoinDepth+1,
				targetJoinDepth,
				nil,
			); err != nil {
				n.logger.Log(ctx, slog.LevelWarn, fmt.Sprintf("setup %s failed, err: %v", newChildMetadataModelfgSuffix, err), "function", intlib.FunctionName(n.AbstractionsGetMetadataModel))
			} else {
				parentMetadataModel, err = n.MetadataModelInsertChildIntoParent(
					parentMetadataModel,
					childMetadataModel,
					intdoment.AbstractionsRepository().DirectoryID,
					false,
					newChildMetadataModelfgSuffix,
					[]string{intdoment.AbstractionsRepository().DirectoryID},
				)
				if err != nil {
					return nil, intlib.FunctionNameAndError(n.AbstractionsGetMetadataModel, err)
				}
			}
		}

		if skipMMJoin, ok := skipJoin[intlib.MetadataModelGenJoinKey(intdoment.AbstractionsRepository().StorageFilesID, intdoment.StorageFilesRepository().RepositoryName)]; !ok || !skipMMJoin {
			newChildMetadataModelfgSuffix := intlib.MetadataModelGenJoinKey(intdoment.AbstractionsRepository().StorageFilesID, intdoment.StorageFilesRepository().RepositoryName)
			if childMetadataModel, err := n.StorageFilesGetMetadataModel(
				ctx,
				currentJoinDepth+1,
				targetJoinDepth,
				nil,
			); err != nil {
				n.logger.Log(ctx, slog.LevelWarn, fmt.Sprintf("setup %s failed, err: %v", newChildMetadataModelfgSuffix, err), "function", intlib.FunctionName(n.AbstractionsGetMetadataModel))
			} else {
				parentMetadataModel, err = n.MetadataModelInsertChildIntoParent(
					parentMetadataModel,
					childMetadataModel,
					intdoment.AbstractionsRepository().StorageFilesID,
					false,
					newChildMetadataModelfgSuffix,
					[]string{intdoment.AbstractionsRepository().StorageFilesID},
				)
				if err != nil {
					return nil, intlib.FunctionNameAndError(n.AbstractionsGetMetadataModel, err)
				}
			}
		}

		if skipMMJoin, ok := skipJoin[intlib.MetadataModelGenJoinKey(intdoment.AbstractionsRepository().RepositoryName, intdoment.AbstractionsAuthorizationIDsRepository().RepositoryName)]; !ok || !skipMMJoin {
			newChildMetadataModelfgSuffix := intlib.MetadataModelGenJoinKey(intdoment.AbstractionsRepository().RepositoryName, intdoment.AbstractionsAuthorizationIDsRepository().RepositoryName)
			if childMetadataModel, err := n.DefaultAuthorizationIDsGetMetadataModel(
				ctx,
				intdoment.AbstractionsAuthorizationIDsRepository().RepositoryName,
				currentJoinDepth+1,
				targetJoinDepth,
				nil,
				intdoment.AbstractionsAuthorizationIDsRepository().CreationIamGroupAuthorizationsID,
				intdoment.AbstractionsAuthorizationIDsRepository().DeactivationIamGroupAuthorizationsID,
			); err != nil {
				n.logger.Log(ctx, slog.LevelWarn, fmt.Sprintf("setup %s failed, err: %v", newChildMetadataModelfgSuffix, err), "function", intlib.FunctionName(n.AbstractionsGetMetadataModel))
			} else {
				parentMetadataModel, err = n.MetadataModelInsertChildIntoParent(parentMetadataModel, childMetadataModel, "", false, newChildMetadataModelfgSuffix, nil)
				if err != nil {
					return nil, intlib.FunctionNameAndError(n.AbstractionsGetMetadataModel, err)
				}
			}
		}
	}

	return parentMetadataModel, nil
}
