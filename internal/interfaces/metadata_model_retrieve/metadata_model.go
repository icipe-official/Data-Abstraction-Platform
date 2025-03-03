package metadatamodelretrieve

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
	"net/http"
	"slices"
	"strings"

	"github.com/gofrs/uuid/v5"
	intdoment "github.com/icipe-official/Data-Abstraction-Platform/internal/domain/entities"
	intdomint "github.com/icipe-official/Data-Abstraction-Platform/internal/domain/interfaces"
	intlib "github.com/icipe-official/Data-Abstraction-Platform/internal/lib"
	intlibjson "github.com/icipe-official/Data-Abstraction-Platform/internal/lib/json"
	intlibmmodel "github.com/icipe-official/Data-Abstraction-Platform/internal/lib/metadata_model"
)

type MetadataModelRetrieve struct {
	logger                      intdomint.Logger
	repo                        intdomint.IamRepository
	authContextDirectoryGroupID uuid.UUID
	iamCredential               *intdoment.IamCredentials
	iamAuthorizationRules       *intdoment.IamAuthorizationRules
}

func NewMetadataModelRetrieve(logger intdomint.Logger, repo intdomint.IamRepository, authContextDirectoryGroupID uuid.UUID, iamCredential *intdoment.IamCredentials, iamAuthorizationRules *intdoment.IamAuthorizationRules) *MetadataModelRetrieve {
	n := new(MetadataModelRetrieve)
	n.logger = logger
	n.repo = repo
	n.authContextDirectoryGroupID = authContextDirectoryGroupID
	n.iamCredential = iamCredential
	n.iamAuthorizationRules = iamAuthorizationRules

	return n
}

func (n *MetadataModelRetrieve) MetadataModelInsertChildIntoParent(
	parentMetadataModel map[string]any,
	childMetadataModel map[string]any,
	targetPositionFieldColumnName string,
	targetBefore bool,
	newChildMetadataModelFgKeySuffix string,
	fieldsColumnsToDisableSkipDataExtraction []string,
) (map[string]any, error) {
	childMetadataModel[intlibmmodel.FIELD_GROUP_PROP_FIELD_GROUP_KEY] = fmt.Sprintf("$.%s%s.%s", intlibmmodel.FIELD_GROUP_PROP_GROUP_FIELDS, intlibmmodel.ARRAY_PATH_PLACEHOLDER, newChildMetadataModelFgKeySuffix)
	groupReadOrderOfFieldsPath := fmt.Sprintf("$.%s", intlibmmodel.FIELD_GROUP_PROP_GROUP_READ_ORDER_OF_FIELDS)
	targetGroupReadOrderOfFieldsSuffix := ""

	if len(targetPositionFieldColumnName) > 0 {
		intlibmmodel.ForEachFieldGroup(parentMetadataModel, func(property map[string]any) bool {
			if property[intlibmmodel.FIELD_GROUP_PROP_DATABASE_TABLE_COLLECTION_UID] == parentMetadataModel[intlibmmodel.FIELD_GROUP_PROP_DATABASE_TABLE_COLLECTION_UID] && property[intlibmmodel.FIELD_GROUP_PROP_DATABASE_FIELD_COLUMN_NAME] == targetPositionFieldColumnName {
				if fgString, ok := property[intlibmmodel.FIELD_GROUP_PROP_FIELD_GROUP_KEY].(string); ok {
					fgStringArray := strings.Split(fgString, ".")
					parentGroupPath := strings.Join(fgStringArray[:len(fgStringArray)-2], ".")
					childMetadataModel[intlibmmodel.FIELD_GROUP_PROP_FIELD_GROUP_KEY] = strings.Replace(childMetadataModel[intlibmmodel.FIELD_GROUP_PROP_FIELD_GROUP_KEY].(string), "$", parentGroupPath, 1)
					groupReadOrderOfFieldsPath = fmt.Sprintf("%s.%s", parentGroupPath, intlibmmodel.FIELD_GROUP_PROP_GROUP_READ_ORDER_OF_FIELDS)
					targetGroupReadOrderOfFieldsSuffix = fgStringArray[len(fgStringArray)-1]
				}
				return true
			}

			return false
		})
	}

	if len(fieldsColumnsToDisableSkipDataExtraction) > 0 {
		if value, ok := intlibmmodel.MapFieldGroups(parentMetadataModel, func(property map[string]any) any {
			if fcnString, ok := property[intlibmmodel.FIELD_GROUP_PROP_DATABASE_FIELD_COLUMN_NAME].(string); ok {
				if slices.Contains(fieldsColumnsToDisableSkipDataExtraction, fcnString) {
					property[intlibmmodel.FIELD_GROUP_PROP_FIELD_GROUP_VIEW_DISABLE] = true
					property[intlibmmodel.FIELD_GROUP_PROP_DATABASE_SKIP_DATA_EXTRACTION] = true
				}
			}

			return property
		}).(map[string]any); ok {
			parentMetadataModel = value
		} else {
			return nil, intlib.FunctionNameAndError(n.MetadataModelInsertChildIntoParent, errors.New("after disable fieldColumns in parentMetadataModel,  parentMetadataModel is not of type map[string]any"))
		}
	}

	if value, ok := intlibmmodel.MapFieldGroups(childMetadataModel, func(property map[string]any) any {
		if fgString, ok := property[intlibmmodel.FIELD_GROUP_PROP_FIELD_GROUP_KEY].(string); ok {
			property[intlibmmodel.FIELD_GROUP_PROP_FIELD_GROUP_KEY] = strings.Replace(fgString, "$", childMetadataModel[intlibmmodel.FIELD_GROUP_PROP_FIELD_GROUP_KEY].(string), 1)
		}
		return property
	}).(map[string]any); ok {
		childMetadataModel = value
	} else {
		return nil, intlib.FunctionNameAndError(n.MetadataModelInsertChildIntoParent, errors.New("update parentMetadataModel tableCollectionUid failed"))
	}

	if value, err := intlibjson.SetValueInObject(parentMetadataModel, intlibmmodel.GetPathToValue(childMetadataModel[intlibmmodel.FIELD_GROUP_PROP_FIELD_GROUP_KEY].(string), false, "[0]"), childMetadataModel); err != nil {
		return nil, intlib.FunctionNameAndError(n.MetadataModelInsertChildIntoParent, err)
	} else {
		if valueMap, ok := value.(map[string]any); ok {
			parentMetadataModel = valueMap
		} else {
			return nil, intlib.FunctionNameAndError(n.MetadataModelInsertChildIntoParent, errors.New("after childMetadataModel insert into parentMetadataModel,  parentMetadataModel is not of type map[string]any"))
		}
	}

	if pathReadOrderOfFields, ok := intlibjson.GetValueInObject(parentMetadataModel, intlibmmodel.GetPathToValue(groupReadOrderOfFieldsPath, false, "[0]")).([]any); ok {
		newPathToGroupReadOrderOfFields := make([]any, 0)
		for _, value := range pathReadOrderOfFields {
			if value == targetGroupReadOrderOfFieldsSuffix {
				if targetBefore {
					newPathToGroupReadOrderOfFields = append(newPathToGroupReadOrderOfFields, newChildMetadataModelFgKeySuffix)
					newPathToGroupReadOrderOfFields = append(newPathToGroupReadOrderOfFields, value)
				} else {
					newPathToGroupReadOrderOfFields = append(newPathToGroupReadOrderOfFields, value)
					newPathToGroupReadOrderOfFields = append(newPathToGroupReadOrderOfFields, newChildMetadataModelFgKeySuffix)
				}
				continue
			}
			newPathToGroupReadOrderOfFields = append(newPathToGroupReadOrderOfFields, value)
		}
		if len(newPathToGroupReadOrderOfFields) == len(pathReadOrderOfFields) {
			newPathToGroupReadOrderOfFields = append(newPathToGroupReadOrderOfFields, newChildMetadataModelFgKeySuffix)
		}
		if value, err := intlibjson.SetValueInObject(parentMetadataModel, intlibmmodel.GetPathToValue(groupReadOrderOfFieldsPath, false, "[0]"), newPathToGroupReadOrderOfFields); err != nil {
			return nil, intlib.FunctionNameAndError(n.MetadataModelInsertChildIntoParent, err)
		} else {
			if valueMap, ok := value.(map[string]any); ok {
				parentMetadataModel = valueMap
			} else {
				return nil, intlib.FunctionNameAndError(n.MetadataModelInsertChildIntoParent, errors.New("after modify groof in parentMetadataModel,  parentMetadataModel is not of type map[string]any"))
			}
		}
	}

	return parentMetadataModel, nil
}

func (n *MetadataModelRetrieve) SetTableCollectionUidForMetadataModel(metadataModel map[string]any) (map[string]any, error) {
	newTableCollectionUid := "_" + intlib.GenRandomString(6, false)
	metadataModel[intlibmmodel.FIELD_GROUP_PROP_DATABASE_TABLE_COLLECTION_UID] = newTableCollectionUid
	if value, ok := intlibmmodel.MapFieldGroups(metadataModel, func(property map[string]any) any {
		property[intlibmmodel.FIELD_GROUP_PROP_DATABASE_TABLE_COLLECTION_UID] = newTableCollectionUid
		return property
	}).(map[string]any); ok {
		return value, nil
	} else {
		return nil, intlib.FunctionNameAndError(n.DirectoryGroupsGetMetadataModel, errors.New("update parentMetadataModel tableCollectionUid failed"))
	}
}

func (n *MetadataModelRetrieve) GetMetadataModel(tableCollectionName string) (map[string]any, error) {
	return intlib.MetadataModelGetDatum(tableCollectionName)
}

func (n *MetadataModelRetrieve) DefaultAuthorizationIDsGetMetadataModel(
	ctx context.Context,
	tableCollectionName string,
	currentJoinDepth int,
	targetJoinDepth int,
	skipJoin map[string]bool,
	creationIamGroupAuthorizationsIDColumnName string,
	deactivationIamGroupAuthorizationsIDColumnName string,
) (map[string]any, error) {
	if iamAuthorizationRule, err := n.repo.RepoIamGroupAuthorizationsGetAuthorized(
		ctx,
		n.iamCredential,
		n.authContextDirectoryGroupID,
		[]*intdoment.IamGroupAuthorizationRule{
			{
				ID:        "",
				RuleGroup: intdoment.AUTH_RULE_GROUP_IAM_GROUP_AUTHORIZATION,
			},
		},
		n.iamAuthorizationRules,
	); err != nil || iamAuthorizationRule == nil {
		return nil, intlib.NewError(http.StatusForbidden, http.StatusText(http.StatusForbidden))
	}

	parentMetadataModel, err := n.GetMetadataModel(tableCollectionName)
	if err != nil {
		return nil, intlib.FunctionNameAndError(n.DefaultAuthorizationIDsGetMetadataModel, err)
	}

	parentMetadataModel, err = n.SetTableCollectionUidForMetadataModel(parentMetadataModel)
	if err != nil {
		return nil, intlib.FunctionNameAndError(n.DefaultAuthorizationIDsGetMetadataModel, err)
	}

	if currentJoinDepth < targetJoinDepth || targetJoinDepth < 0 {
		if skipJoin == nil {
			skipJoin = make(map[string]bool)
		}

		if skipMMJoin, ok := skipJoin[intlib.MetadataModelGenJoinKey(creationIamGroupAuthorizationsIDColumnName, intdoment.IamGroupAuthorizationsRepository().RepositoryName)]; !ok || !skipMMJoin {
			newChildMetadataModelfgSuffix := intlib.MetadataModelGenJoinKey(creationIamGroupAuthorizationsIDColumnName, intdoment.IamGroupAuthorizationsRepository().RepositoryName)
			skipJoin := make(map[string]bool)
			skipJoin[intlib.MetadataModelGenJoinKey(intdoment.IamGroupAuthorizationsRepository().RepositoryName, intdoment.IamGroupAuthorizationsIDsRepository().RepositoryName)] = true
			if childMetadataModel, err := n.IamGroupAuthorizationsGetMetadataModel(ctx, currentJoinDepth+1, targetJoinDepth, skipJoin); err != nil {
				n.logger.Log(ctx, slog.LevelWarn, fmt.Sprintf("setup %s failed, err: %v", newChildMetadataModelfgSuffix, err), "function", intlib.FunctionName(n.DefaultAuthorizationIDsGetMetadataModel))
			} else {
				childMetadataModel[intlibmmodel.FIELD_GROUP_PROP_FIELD_GROUP_NAME] = "Creation Iam Group Authorization"
				parentMetadataModel, err = n.MetadataModelInsertChildIntoParent(
					parentMetadataModel,
					childMetadataModel,
					creationIamGroupAuthorizationsIDColumnName,
					false,
					newChildMetadataModelfgSuffix,
					[]string{creationIamGroupAuthorizationsIDColumnName},
				)
				if err != nil {
					return nil, intlib.FunctionNameAndError(n.DefaultAuthorizationIDsGetMetadataModel, err)
				}
			}
		}

		if skipMMJoin, ok := skipJoin[intlib.MetadataModelGenJoinKey(deactivationIamGroupAuthorizationsIDColumnName, intdoment.IamGroupAuthorizationsRepository().RepositoryName)]; !ok || !skipMMJoin {
			newChildMetadataModelfgSuffix := intlib.MetadataModelGenJoinKey(deactivationIamGroupAuthorizationsIDColumnName, intdoment.IamGroupAuthorizationsRepository().RepositoryName)
			skipJoin := make(map[string]bool)
			skipJoin[intlib.MetadataModelGenJoinKey(intdoment.IamGroupAuthorizationsRepository().RepositoryName, intdoment.IamGroupAuthorizationsIDsRepository().RepositoryName)] = true
			if childMetadataModel, err := n.IamGroupAuthorizationsGetMetadataModel(ctx, currentJoinDepth+1, targetJoinDepth, skipJoin); err != nil {
				n.logger.Log(ctx, slog.LevelWarn, fmt.Sprintf("setup %s failed, err: %v", newChildMetadataModelfgSuffix, err), "function", intlib.FunctionName(n.DefaultAuthorizationIDsGetMetadataModel))
			} else {
				childMetadataModel[intlibmmodel.FIELD_GROUP_PROP_FIELD_GROUP_NAME] = "Deactivation Iam Group Authorization"
				parentMetadataModel, err = n.MetadataModelInsertChildIntoParent(
					parentMetadataModel,
					childMetadataModel,
					deactivationIamGroupAuthorizationsIDColumnName,
					false,
					newChildMetadataModelfgSuffix,
					[]string{deactivationIamGroupAuthorizationsIDColumnName},
				)
				if err != nil {
					return nil, intlib.FunctionNameAndError(n.DirectoryGroupsGetMetadataModel, err)
				}
			}
		}
	}

	return parentMetadataModel, nil
}
