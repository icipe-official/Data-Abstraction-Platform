package postgres

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log/slog"
	"net/http"
	"slices"
	"strings"

	"github.com/brunoga/deep"
	"github.com/gofrs/uuid/v5"
	intdoment "github.com/icipe-official/Data-Abstraction-Platform/internal/domain/entities"
	intdomint "github.com/icipe-official/Data-Abstraction-Platform/internal/domain/interfaces"
	intlib "github.com/icipe-official/Data-Abstraction-Platform/internal/lib"
	intlibmmodel "github.com/icipe-official/Data-Abstraction-Platform/internal/lib/metadata_model"
	"github.com/jackc/pgx/v5"
)

func (n *PostrgresRepository) RepoStorageDrivesDeleteOne(
	ctx context.Context,
	iamAuthRule *intdoment.IamAuthorizationRule,
	datum *intdoment.StorageDrives,
) error {
	transaction, err := n.db.BeginTx(ctx, pgx.TxOptions{})
	if err != nil {
		return intlib.FunctionNameAndError(n.RepoStorageDrivesDeleteOne, fmt.Errorf("start transaction to delete %s failed, error: %v", intdoment.StorageDrivesRepository().RepositoryName, err))
	}

	query := fmt.Sprintf(
		"DELETE FROM %[1]s WHERE %[2]s = $1;",
		intdoment.StorageDrivesAuthorizationIDsRepository().RepositoryName, //1
		intdoment.StorageDrivesAuthorizationIDsRepository().ID,             //2
	)
	n.logger.Log(ctx, slog.LevelDebug, query, "function", intlib.FunctionName(n.RepoStorageDrivesDeleteOne))

	if _, err := transaction.Exec(ctx, query, datum.ID[0]); err == nil {
		query := fmt.Sprintf(
			"DELETE FROM %[1]s WHERE %[2]s = $1;",
			intdoment.StorageDrivesRepository().RepositoryName, //1
			intdoment.StorageDrivesRepository().ID,             //2
		)
		n.logger.Log(ctx, slog.LevelDebug, query, "function", intlib.FunctionName(n.RepoStorageDrivesDeleteOne))
		if _, err := transaction.Exec(ctx, query, datum.ID[0]); err == nil {
			if err := transaction.Commit(ctx); err != nil {
				return intlib.FunctionNameAndError(n.RepoStorageDrivesDeleteOne, fmt.Errorf("commit transaction to delete %s failed, error: %v", intdoment.StorageDrivesRepository().RepositoryName, err))
			}
			return nil
		} else {
			transaction.Rollback(ctx)
		}
	}

	transaction, err = n.db.BeginTx(ctx, pgx.TxOptions{})
	if err != nil {
		return intlib.FunctionNameAndError(n.RepoStorageDrivesDeleteOne, fmt.Errorf("start transaction to deactivate %s failed, error: %v", intdoment.StorageDrivesRepository().RepositoryName, err))
	}

	query = fmt.Sprintf(
		"UPDATE %[1]s SET %[2]s = $1 WHERE %[3]s = $2;",
		intdoment.StorageDrivesAuthorizationIDsRepository().RepositoryName,                       //1
		intdoment.StorageDrivesAuthorizationIDsRepository().DeactivationIamGroupAuthorizationsID, //2
		intdoment.StorageDrivesAuthorizationIDsRepository().ID,                                   //3
	)
	n.logger.Log(ctx, slog.LevelDebug, query, "function", intlib.FunctionName(n.RepoStorageDrivesDeleteOne))
	if _, err := transaction.Exec(ctx, query, iamAuthRule.ID, datum.ID[0]); err == nil {
		transaction.Rollback(ctx)
		return intlib.FunctionNameAndError(n.RepoStorageDrivesDeleteOne, fmt.Errorf("update %s failed, err: %v", intdoment.StorageDrivesAuthorizationIDsRepository().RepositoryName, err))
	}

	query = fmt.Sprintf(
		"UPDATE %[1]s SET %[2]s = NOW() WHERE %[3]s = $1;",
		intdoment.StorageDrivesRepository().RepositoryName, //1
		intdoment.StorageDrivesRepository().DeactivatedOn,  //2
		intdoment.StorageDrivesRepository().ID,             //3
	)
	n.logger.Log(ctx, slog.LevelDebug, query, "function", intlib.FunctionName(n.RepoStorageDrivesDeleteOne))
	if _, err := transaction.Exec(ctx, query, datum.ID[0]); err == nil {
		transaction.Rollback(ctx)
		return intlib.FunctionNameAndError(n.RepoStorageDrivesDeleteOne, fmt.Errorf("update %s failed, err: %v", intdoment.StorageDrivesRepository().RepositoryName, err))
	}

	if err := transaction.Commit(ctx); err != nil {
		return intlib.FunctionNameAndError(n.RepoStorageDrivesDeleteOne, fmt.Errorf("commit transaction to update deactivation of %s failed, error: %v", intdoment.StorageDrivesRepository().RepositoryName, err))
	}

	return nil
}

func (n *PostrgresRepository) RepoStorageDrivesUpdateOne(ctx context.Context, datum *intdoment.StorageDrives) error {
	valuesToUpdate := make([]any, 0)
	columnsToUpdate := make([]string, 0)
	if v, c, err := n.RepoStorageDrivesValidateAndGetColumnsAndData(datum, false); err != nil {
		return err
	} else if len(c) == 0 || len(v) == 0 {
		return intlib.NewError(http.StatusBadRequest, "no values to update")
	} else {
		valuesToUpdate = append(valuesToUpdate, v...)
		columnsToUpdate = append(columnsToUpdate, c...)
	}

	nextPlaceholder := 1
	query := fmt.Sprintf(
		"UPDATE %[1]s SET %[2]s WHERE %[3]s = %[4]s AND %[5]s IS NULL;",
		intdoment.StorageDrivesRepository().RepositoryName,     //1
		GetUpdateSetColumns(columnsToUpdate, &nextPlaceholder), //2
		intdoment.StorageDrivesRepository().ID,                 //3
		GetandUpdateNextPlaceholder(&nextPlaceholder),          //4
		intdoment.StorageDrivesRepository().DeactivatedOn,      //5
	)
	n.logger.Log(ctx, slog.LevelDebug, query, "function", intlib.FunctionName(n.RepoStorageDrivesUpdateOne))
	valuesToUpdate = append(valuesToUpdate, datum.ID[0])

	if _, err := n.db.Exec(ctx, query, valuesToUpdate...); err != nil {
		return intlib.FunctionNameAndError(n.RepoStorageDrivesUpdateOne, fmt.Errorf("update %s failed, err: %v", intdoment.StorageDrivesRepository().RepositoryName, err))
	}

	return nil
}

func (n *PostrgresRepository) RepoStorageDrivesInsertOne(
	ctx context.Context,
	iamAuthRule *intdoment.IamAuthorizationRule,
	datum *intdoment.StorageDrives,
	columns []string,
) (*intdoment.StorageDrives, error) {
	storageDrivesMetadataModel, err := intlib.MetadataModelGet(intdoment.StorageDrivesRepository().RepositoryName)
	if err != nil {
		return nil, intlib.FunctionNameAndError(n.RepoStorageDrivesInsertOne, err)
	}

	if len(columns) == 0 {
		if dbColumnFields, err := intlibmmodel.DatabaseGetColumnFields(storageDrivesMetadataModel, intdoment.StorageDrivesRepository().RepositoryName, false, false); err != nil {
			return nil, intlib.FunctionNameAndError(n.RepoStorageDrivesInsertOne, err)
		} else {
			columns = dbColumnFields.ColumnFieldsReadOrder
		}
	}

	if !slices.Contains(columns, intdoment.StorageDrivesRepository().ID) {
		columns = append(columns, intdoment.StorageDrivesRepository().ID)
	}

	transaction, err := n.db.BeginTx(ctx, pgx.TxOptions{})
	if err != nil {
		return nil, intlib.FunctionNameAndError(n.RepoStorageDrivesInsertOne, fmt.Errorf("start transaction to create %s failed, error: %v", intdoment.StorageDrivesRepository().RepositoryName, err))
	}

	valuesToInsert := make([]any, 0)
	columnsToInsert := make([]string, 0)
	if v, c, err := n.RepoStorageDrivesValidateAndGetColumnsAndData(datum, true); err != nil {
		return nil, err
	} else {
		valuesToInsert = append(valuesToInsert, v...)
		columnsToInsert = append(columnsToInsert, c...)
	}

	query := fmt.Sprintf(
		"INSERT INTO %[1]s (%[2]s) VALUES (%[3]s) RETURNING %[4]s;",
		intdoment.StorageDrivesRepository().RepositoryName,           //1
		strings.Join(columnsToInsert, " , "),                         //2
		GetQueryPlaceholderString(len(valuesToInsert), &[]int{1}[0]), //3
		strings.Join(columns, " , "),                                 //4
	)
	n.logger.Log(ctx, slog.LevelDebug, query, "function", intlib.FunctionName(n.RepoStorageDrivesInsertOne))

	rows, err := transaction.Query(ctx, query, valuesToInsert...)
	if err != nil {
		transaction.Rollback(ctx)
		return nil, intlib.FunctionNameAndError(n.RepoStorageDrivesInsertOne, fmt.Errorf("insert %s failed, err: %v", intdoment.StorageDrivesRepository().RepositoryName, err))
	}

	defer rows.Close()
	dataRows := make([]any, 0)
	for rows.Next() {
		if r, err := rows.Values(); err != nil {
			transaction.Rollback(ctx)
			return nil, intlib.FunctionNameAndError(n.RepoStorageDrivesInsertOne, err)
		} else {
			dataRows = append(dataRows, r)
		}
	}

	array2DToObject, err := intlibmmodel.NewConvert2DArrayToObjects(storageDrivesMetadataModel, nil, false, false, columns)
	if err != nil {
		transaction.Rollback(ctx)
		return nil, intlib.FunctionNameAndError(n.RepoStorageDrivesInsertOne, err)
	}
	if err := array2DToObject.Convert(dataRows); err != nil {
		transaction.Rollback(ctx)
		return nil, intlib.FunctionNameAndError(n.RepoStorageDrivesInsertOne, err)
	}

	if len(array2DToObject.Objects()) == 0 {
		transaction.Rollback(ctx)
		return nil, nil
	}

	if len(array2DToObject.Objects()) > 1 {
		transaction.Rollback(ctx)
		n.logger.Log(ctx, slog.LevelError, fmt.Sprintf("length of array2DToObject.Objects(): %v", len(array2DToObject.Objects())), "function", intlib.FunctionName(n.RepoStorageDrivesInsertOne))
		return nil, intlib.FunctionNameAndError(n.RepoStorageDrivesInsertOne, fmt.Errorf("more than one %s found", intdoment.StorageDrivesRepository().RepositoryName))
	}

	storageDrive := new(intdoment.StorageDrives)
	if jsonData, err := json.Marshal(array2DToObject.Objects()[0]); err != nil {
		transaction.Rollback(ctx)
		return nil, intlib.FunctionNameAndError(n.RepoStorageDrivesInsertOne, err)
	} else {
		n.logger.Log(ctx, slog.LevelDebug, "json parsing storageDrive", "storageDrive", string(jsonData), "function", intlib.FunctionName(n.RepoStorageDrivesInsertOne))
		if err := json.Unmarshal(jsonData, storageDrive); err != nil {
			transaction.Rollback(ctx)
			return nil, intlib.FunctionNameAndError(n.RepoStorageDrivesInsertOne, err)
		}
	}

	query = fmt.Sprintf(
		"INSERT INTO %[1]s (%[2]s, %[3]s) VALUES ($1, $2);",
		intdoment.StorageDrivesAuthorizationIDsRepository().RepositoryName,                   //1
		intdoment.StorageDrivesAuthorizationIDsRepository().ID,                               //2
		intdoment.StorageDrivesAuthorizationIDsRepository().CreationIamGroupAuthorizationsID, //3
	)
	n.logger.Log(ctx, slog.LevelDebug, query, "function", intlib.FunctionName(n.RepoStorageDrivesInsertOne))

	if _, err := transaction.Exec(ctx, query, storageDrive.ID[0], iamAuthRule.ID); err != nil {
		transaction.Rollback(ctx)
		return nil, intlib.FunctionNameAndError(n.RepoStorageDrivesInsertOne, fmt.Errorf("insert %s failed, err: %v", intdoment.StorageDrivesAuthorizationIDsRepository().RepositoryName, err))
	}

	if err := transaction.Commit(ctx); err != nil {
		return nil, intlib.FunctionNameAndError(n.RepoStorageDrivesInsertOne, fmt.Errorf("commit transaction to create %s failed, error: %v", intdoment.StorageDrivesRepository().RepositoryName, err))
	}

	return storageDrive, nil
}

func (n *PostrgresRepository) RepoStorageDrivesValidateAndGetColumnsAndData(datum *intdoment.StorageDrives, insert bool) ([]any, []string, error) {
	values := make([]any, 0)
	columns := make([]string, 0)

	if len(datum.StorageDriveTypesID) == 0 || len(datum.StorageDriveTypesID[0]) < 4 {
		if insert {
			return nil, nil, fmt.Errorf("%s is not valid", intdoment.StorageDrivesRepository().StorageDriveTypesID)
		}
	} else {
		values = append(values, datum.StorageDriveTypesID[0])
		columns = append(columns, intdoment.StorageDrivesRepository().StorageDriveTypesID)
	}

	if len(datum.Description) == 0 || len(datum.Description[0]) < 4 {
		if insert {
			return nil, nil, fmt.Errorf("%s is not valid", intdoment.StorageDrivesRepository().Description)
		}
	} else {
		values = append(values, datum.Description[0])
		columns = append(columns, intdoment.StorageDrivesRepository().Description)
	}

	if len(datum.Data) == 0 {
		if insert {
			return nil, nil, fmt.Errorf("%s is not valid", intdoment.StorageDrivesRepository().Data)
		}
	} else {
		values = append(values, datum.Data[0])
		columns = append(columns, intdoment.StorageDrivesRepository().Data)
	}

	return values, columns, nil
}

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
		if sq, err := n.StorageDrivesTypesGetSelectQuery(
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

	storageDrivesJoinStorageDrivesAuthorizationIDs := intlib.MetadataModelGenJoinKey(intdoment.StorageDrivesRepository().RepositoryName, intdoment.StorageDrivesAuthorizationIDsRepository().RepositoryName)
	if value, err := n.extractChildMetadataModel(metadataModel, storageDrivesJoinStorageDrivesAuthorizationIDs); err != nil {
		n.logger.Log(ctx, slog.LevelDebug, fmt.Sprintf("extract %s child metadata model failed, error: %v", storageDrivesJoinStorageDrivesAuthorizationIDs, err))
	} else {
		if sq, err := n.AuthorizationIDsGetSelectQuery(
			ctx,
			value,
			metadataModelParentPath,
			intdoment.StorageDrivesAuthorizationIDsRepository().RepositoryName,
			[]AuthIDsSelectQueryPKey{{Name: intdoment.StorageDrivesAuthorizationIDsRepository().ID, ProcessAs: PROCESS_QUERY_CONDITION_AS_SINGLE_VALUE}},
			intdoment.StorageDrivesAuthorizationIDsRepository().CreationIamGroupAuthorizationsID,
			intdoment.StorageDrivesAuthorizationIDsRepository().DeactivationIamGroupAuthorizationsID,
		); err != nil {
			n.logger.Log(ctx, slog.LevelDebug, fmt.Sprintf("get child %s psql query failed, error: %v", storageDrivesJoinStorageDrivesAuthorizationIDs, err))
		} else {
			sq.JoinType = JOIN_INNER
			sq.JoinQuery = make([]string, 1)
			sq.JoinQuery[0] = fmt.Sprintf(
				"%[1]s = %[2]s",
				GetJoinColumnName(sq.TableUid, intdoment.StorageDrivesAuthorizationIDsRepository().ID, true), //1
				GetJoinColumnName(selectQuery.TableUid, intdoment.StorageDrivesRepository().ID, false),       //2
			)

			selectQuery.Join[storageDrivesJoinStorageDrivesAuthorizationIDs] = sq
		}
	}

	selectQuery.appendSort()
	selectQuery.appendLimitOffset(metadataModel)

	return &selectQuery, nil
}
