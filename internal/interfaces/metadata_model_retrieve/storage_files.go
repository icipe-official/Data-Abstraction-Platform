package metadatamodelretrieve

import (
	"context"
	"fmt"
	"log/slog"

	intdoment "github.com/icipe-official/Data-Abstraction-Platform/internal/domain/entities"
	intlib "github.com/icipe-official/Data-Abstraction-Platform/internal/lib"
)

func (n *MetadataModelRetrieve) StorageFilesGetMetadataModel(ctx context.Context, currentJoinDepth int, targetJoinDepth int, skipJoin map[string]bool) (map[string]any, error) {
	parentMetadataModel, err := n.GetMetadataModel(intdoment.StorageFilesRepository().RepositoryName)
	if err != nil {
		return nil, intlib.FunctionNameAndError(n.StorageFilesGetMetadataModel, err)
	}

	parentMetadataModel, err = n.SetTableCollectionUidForMetadataModel(parentMetadataModel)
	if err != nil {
		return nil, intlib.FunctionNameAndError(n.StorageFilesGetMetadataModel, err)
	}

	if currentJoinDepth < targetJoinDepth || targetJoinDepth < 0 {
		if skipJoin == nil {
			skipJoin = make(map[string]bool)
		}

		if skipMMJoin, ok := skipJoin[intlib.MetadataModelGenJoinKey(intdoment.StorageFilesRepository().StorageDrivesID, intdoment.StorageDrivesGroupsRepository().RepositoryName)]; !ok || !skipMMJoin {
			newChildMetadataModelfgSuffix := intlib.MetadataModelGenJoinKey(intdoment.StorageFilesRepository().StorageDrivesID, intdoment.StorageDrivesGroupsRepository().RepositoryName)
			if childMetadataModel, err := n.StorageDrivesGroupsGetMetadataModel(
				ctx,
				currentJoinDepth+1,
				targetJoinDepth,
				nil,
			); err != nil {
				n.logger.Log(ctx, slog.LevelWarn, fmt.Sprintf("setup %s failed, err: %v", newChildMetadataModelfgSuffix, err), "function", intlib.FunctionName(n.StorageFilesGetMetadataModel))
			} else {
				parentMetadataModel, err = n.MetadataModelInsertChildIntoParent(
					parentMetadataModel,
					childMetadataModel,
					intdoment.StorageFilesRepository().DirectoryGroupsID,
					false,
					newChildMetadataModelfgSuffix,
					[]string{intdoment.StorageFilesRepository().StorageDrivesID, intdoment.StorageFilesRepository().DirectoryGroupsID},
				)
				if err != nil {
					return nil, intlib.FunctionNameAndError(n.StorageFilesGetMetadataModel, err)
				}
			}
		}

		if skipMMJoin, ok := skipJoin[intlib.MetadataModelGenJoinKey(intdoment.StorageFilesRepository().DirectoryID, intdoment.DirectoryRepository().RepositoryName)]; !ok || !skipMMJoin {
			newChildMetadataModelfgSuffix := intlib.MetadataModelGenJoinKey(intdoment.StorageFilesRepository().DirectoryID, intdoment.DirectoryRepository().RepositoryName)
			if childMetadataModel, err := n.DirectoryGetMetadataModel(
				ctx,
				currentJoinDepth+1,
				targetJoinDepth,
				nil,
			); err != nil {
				n.logger.Log(ctx, slog.LevelWarn, fmt.Sprintf("setup %s failed, err: %v", newChildMetadataModelfgSuffix, err), "function", intlib.FunctionName(n.StorageFilesGetMetadataModel))
			} else {
				parentMetadataModel, err = n.MetadataModelInsertChildIntoParent(
					parentMetadataModel,
					childMetadataModel,
					intdoment.StorageFilesRepository().DirectoryID,
					false,
					newChildMetadataModelfgSuffix,
					[]string{intdoment.StorageFilesRepository().DirectoryID},
				)
				if err != nil {
					return nil, intlib.FunctionNameAndError(n.StorageFilesGetMetadataModel, err)
				}
			}
		}

		if skipMMJoin, ok := skipJoin[intlib.MetadataModelGenJoinKey(intdoment.StorageFilesRepository().RepositoryName, intdoment.StorageFilesAuthorizationIDsRepository().RepositoryName)]; !ok || !skipMMJoin {
			newChildMetadataModelfgSuffix := intlib.MetadataModelGenJoinKey(intdoment.StorageFilesRepository().RepositoryName, intdoment.StorageFilesAuthorizationIDsRepository().RepositoryName)
			if childMetadataModel, err := n.DefaultAuthorizationIDsGetMetadataModel(
				ctx,
				intdoment.StorageFilesAuthorizationIDsRepository().RepositoryName,
				currentJoinDepth+1,
				targetJoinDepth,
				nil,
				intdoment.StorageFilesAuthorizationIDsRepository().CreationIamGroupAuthorizationsID,
				intdoment.StorageFilesAuthorizationIDsRepository().DeactivationIamGroupAuthorizationsID,
			); err != nil {
				n.logger.Log(ctx, slog.LevelWarn, fmt.Sprintf("setup %s failed, err: %v", newChildMetadataModelfgSuffix, err), "function", intlib.FunctionName(n.StorageFilesGetMetadataModel))
			} else {
				parentMetadataModel, err = n.MetadataModelInsertChildIntoParent(parentMetadataModel, childMetadataModel, "", false, newChildMetadataModelfgSuffix, nil)
				if err != nil {
					return nil, intlib.FunctionNameAndError(n.StorageFilesGetMetadataModel, err)
				}
			}
		}
	}

	return parentMetadataModel, nil
}
