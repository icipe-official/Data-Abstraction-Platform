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

	parentMetadataModel, err = n.SetTableCollectionUidForMetadataModel(parentMetadataModel)
	if err != nil {
		return nil, intlib.FunctionNameAndError(n.MetadataModelsGetMetadataModel, err)
	}

	if currentJoinDepth < targetJoinDepth || targetJoinDepth < 0 {
		if skipJoin == nil {
			skipJoin = make(map[string]bool)
		}

		if skipMMJoin, ok := skipJoin[intlib.MetadataModelGenJoinKey(intdoment.StorageDrivesRepository().StorageDriveTypesID, intdoment.StorageDrivesTypesRepository().RepositoryName)]; !ok || !skipMMJoin {
			newChildMetadataModelfgSuffix := intlib.MetadataModelGenJoinKey(intdoment.StorageDrivesRepository().StorageDriveTypesID, intdoment.StorageDrivesTypesRepository().RepositoryName)
			if childMetadataModel, err := n.StorageDrivesTypesGetMetadataModel(ctx); err != nil {
				n.logger.Log(ctx, slog.LevelWarn, fmt.Sprintf("setup %s failed, err: %v", newChildMetadataModelfgSuffix, err), "function", intlib.FunctionName(n.MetadataModelsGetMetadataModel))
			} else {
				parentMetadataModel, err = n.MetadataModelInsertChildIntoParent(
					parentMetadataModel,
					childMetadataModel,
					intdoment.StorageDrivesRepository().StorageDriveTypesID,
					false,
					newChildMetadataModelfgSuffix,
					[]string{intdoment.StorageDrivesRepository().StorageDriveTypesID},
				)
				if err != nil {
					return nil, intlib.FunctionNameAndError(n.MetadataModelsGetMetadataModel, err)
				}
			}
		}
	}

	return parentMetadataModel, nil
}
