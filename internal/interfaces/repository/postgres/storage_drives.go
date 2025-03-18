package postgres

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
	"net/http"

	"github.com/brunoga/deep"
	"github.com/gofrs/uuid/v5"
	intdoment "github.com/icipe-official/Data-Abstraction-Platform/internal/domain/entities"
	intdomint "github.com/icipe-official/Data-Abstraction-Platform/internal/domain/interfaces"
	intlib "github.com/icipe-official/Data-Abstraction-Platform/internal/lib"
	intlibmmodel "github.com/icipe-official/Data-Abstraction-Platform/internal/lib/metadata_model"
)

func (n *PostrgresRepository) RepoStorageDrivesSearch(
	ctx context.Context,
	mmsearch *intdoment.MetadataModelSearch,
	repo intdomint.IamRepository,
	iamCredential *intdoment.IamCredentials,
	iamAuthorizationRules *intdoment.IamAuthorizationRules,
	startSearchDirectoryGroupID uuid.UUID,
	authContextDirectoryGroupID uuid.UUID,
	skipIfFGDisabled bool,
	skipIfDataExtraction bool,
	whereAfterJoin bool,
) (*intdoment.MetadataModelSearchResults, error) {
	pSelectQuery := NewPostgresSelectQuery(
		n.logger,
		repo,
		iamCredential,
		iamAuthorizationRules,
		startSearchDirectoryGroupID,
		authContextDirectoryGroupID,
		mmsearch.QueryConditions,
		skipIfFGDisabled,
		skipIfDataExtraction,
		whereAfterJoin,
	)
	selectQuery, err := pSelectQuery.StorageDrivesGetSelectQuery(ctx, mmsearch.MetadataModel, "")
	if err != nil {
		return nil, intlib.FunctionNameAndError(n.RepoStorageDrivesSearch, err)
	}

	query, selectQueryExtract := GetSelectQuery(selectQuery, whereAfterJoin)
	n.logger.Log(ctx, slog.LevelDebug, query, "function", intlib.FunctionName(n.RepoStorageDrivesSearch))

	rows, err := n.db.Query(ctx, query)
	if err != nil {
		return nil, intlib.FunctionNameAndError(n.RepoStorageDrivesSearch, fmt.Errorf("retrieve %s failed, err: %v", intdoment.StorageDrivesRepository().RepositoryName, err))
	}
	defer rows.Close()
	dataRows := make([]any, 0)
	for rows.Next() {
		if r, err := rows.Values(); err != nil {
			return nil, intlib.FunctionNameAndError(n.RepoStorageDrivesSearch, err)
		} else {
			dataRows = append(dataRows, r)
		}
	}

	array2DToObject, err := intlibmmodel.NewConvert2DArrayToObjects(mmsearch.MetadataModel, selectQueryExtract.Fields, false, false, nil)
	if err != nil {
		return nil, intlib.FunctionNameAndError(n.RepoStorageDrivesSearch, err)
	}
	if err := array2DToObject.Convert(dataRows); err != nil {
		return nil, intlib.FunctionNameAndError(n.RepoStorageDrivesSearch, err)
	}

	mmSearchResults := new(intdoment.MetadataModelSearchResults)
	mmSearchResults.MetadataModel = deep.MustCopy(mmsearch.MetadataModel)
	if len(array2DToObject.Objects()) > 0 {
		mmSearchResults.Data = array2DToObject.Objects()
	} else {
		mmSearchResults.Data = make([]any, 0)
	}

	return mmSearchResults, nil
}

func (n *PostgresSelectQuery) StorageDrivesGetSelectQuery(ctx context.Context, metadataModel map[string]any, metadataModelParentPath string) (*SelectQuery, error) {
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

	quoteColumns := true
	if len(metadataModelParentPath) == 0 {
		metadataModelParentPath = "$"
		quoteColumns = false
	}
	if !n.whereAfterJoin {
		quoteColumns = false
	}

	selectQuery := SelectQuery{
		TableName: intdoment.StorageDrivesRepository().RepositoryName,
		Query:     "",
		Where:     make(map[string]map[int][][]string),
		Join:      make(map[string]*SelectQuery),
		JoinQuery: make([]string, 0),
	}

	if tableUid, ok := metadataModel[intlibmmodel.FIELD_GROUP_PROP_DATABASE_TABLE_COLLECTION_UID].(string); ok && len(tableUid) > 0 {
		selectQuery.TableUid = tableUid
	} else {
		return nil, intlib.FunctionNameAndError(n.StorageDrivesGetSelectQuery, errors.New("tableUid is empty"))
	}

	if value, err := intlibmmodel.DatabaseGetColumnFields(metadataModel, selectQuery.TableUid, false, false); err != nil {
		return nil, intlib.FunctionNameAndError(n.StorageDrivesGetSelectQuery, fmt.Errorf("extract database column fields failed, error: %v", err))
	} else {
		selectQuery.Columns = value
	}

	if _, ok := selectQuery.Columns.Fields[intdoment.StorageDrivesRepository().ID][intlibmmodel.FIELD_GROUP_PROP_FIELD_GROUP_KEY].(string); ok {
		if value := n.getWhereCondition(quoteColumns, selectQuery.TableUid, "", intdoment.StorageDrivesRepository().ID, "", PROCESS_QUERY_CONDITION_AS_SINGLE_VALUE, ""); len(value) > 0 {
			selectQuery.Where[intdoment.StorageDrivesRepository().ID] = value
		}
	}
	if _, ok := selectQuery.Columns.Fields[intdoment.StorageDrivesRepository().StorageDriveTypesID][intlibmmodel.FIELD_GROUP_PROP_FIELD_GROUP_KEY].(string); ok {
		if value := n.getWhereCondition(quoteColumns, selectQuery.TableUid, "", intdoment.StorageDrivesRepository().StorageDriveTypesID, "", PROCESS_QUERY_CONDITION_AS_SINGLE_VALUE, ""); len(value) > 0 {
			selectQuery.Where[intdoment.StorageDrivesRepository().StorageDriveTypesID] = value
		}
	}
	if _, ok := selectQuery.Columns.Fields[intdoment.StorageDrivesRepository().Description][intlibmmodel.FIELD_GROUP_PROP_FIELD_GROUP_KEY].(string); ok {
		if value := n.getWhereCondition(quoteColumns, selectQuery.TableUid, "", intdoment.StorageDrivesRepository().Description, "", PROCESS_QUERY_CONDITION_AS_SINGLE_VALUE, ""); len(value) > 0 {
			selectQuery.Where[intdoment.StorageDrivesRepository().Description] = value
		}
	}
	if _, ok := selectQuery.Columns.Fields[intdoment.StorageDrivesRepository().CreatedOn][intlibmmodel.FIELD_GROUP_PROP_FIELD_GROUP_KEY].(string); ok {
		if value := n.getWhereCondition(quoteColumns, selectQuery.TableUid, "", intdoment.StorageDrivesRepository().CreatedOn, "", PROCESS_QUERY_CONDITION_AS_SINGLE_VALUE, ""); len(value) > 0 {
			selectQuery.Where[intdoment.StorageDrivesRepository().CreatedOn] = value
		}
	}
	if _, ok := selectQuery.Columns.Fields[intdoment.StorageDrivesRepository().LastUpdatedOn][intlibmmodel.FIELD_GROUP_PROP_FIELD_GROUP_KEY].(string); ok {
		if value := n.getWhereCondition(quoteColumns, selectQuery.TableUid, "", intdoment.StorageDrivesRepository().LastUpdatedOn, "", PROCESS_QUERY_CONDITION_AS_SINGLE_VALUE, ""); len(value) > 0 {
			selectQuery.Where[intdoment.StorageDrivesRepository().LastUpdatedOn] = value
		}
	}
	if _, ok := selectQuery.Columns.Fields[intdoment.StorageDrivesRepository().DeactivatedOn][intlibmmodel.FIELD_GROUP_PROP_FIELD_GROUP_KEY].(string); ok {
		if value := n.getWhereCondition(quoteColumns, selectQuery.TableUid, "", intdoment.StorageDrivesRepository().DeactivatedOn, "", PROCESS_QUERY_CONDITION_AS_SINGLE_VALUE, ""); len(value) > 0 {
			selectQuery.Where[intdoment.StorageDrivesRepository().DeactivatedOn] = value
		}
	}

	storageDriveTypeIDJoinStorageDriveTypes := intlib.MetadataModelGenJoinKey(intdoment.StorageDrivesRepository().StorageDriveTypesID, intdoment.StorageDrivesTypesRepository().RepositoryName)
	if value, err := n.extractChildMetadataModel(metadataModel, storageDriveTypeIDJoinStorageDriveTypes); err != nil {
		n.logger.Log(ctx, slog.LevelDebug, fmt.Sprintf("extract %s child metadata model failed, error: %v", storageDriveTypeIDJoinStorageDriveTypes, err))
	} else {
		if sq, err := n.DirectoryGetSelectQuery(
			ctx,
			value,
			metadataModelParentPath,
		); err != nil {
			n.logger.Log(ctx, slog.LevelDebug, fmt.Sprintf("get child %s psql query failed, error: %v", storageDriveTypeIDJoinStorageDriveTypes, err))
		} else {
			sq.JoinType = JOIN_INNER
			sq.JoinQuery = make([]string, 1)
			sq.JoinQuery[0] = fmt.Sprintf(
				"%[1]s = %[2]s",
				GetJoinColumnName(sq.TableUid, intdoment.StorageDrivesTypesRepository().ID, true),                       //1
				GetJoinColumnName(selectQuery.TableUid, intdoment.StorageDrivesRepository().StorageDriveTypesID, false), //2
			)

			selectQuery.Join[storageDriveTypeIDJoinStorageDriveTypes] = sq
		}
	}

	selectQuery.appendSort()
	selectQuery.appendLimitOffset(metadataModel)

	return &selectQuery, nil
}
