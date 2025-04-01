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

func (n *PostrgresRepository) RepoStorageDrivesGroupsDeleteOne(
	ctx context.Context,
	iamAuthRule *intdoment.IamAuthorizationRule,
	datum *intdoment.StorageDrivesGroups,
) error {
	transaction, err := n.db.BeginTx(ctx, pgx.TxOptions{})
	if err != nil {
		return intlib.FunctionNameAndError(n.RepoStorageDrivesGroupsDeleteOne, fmt.Errorf("start transaction to delete %s failed, error: %v", intdoment.StorageDrivesGroupsRepository().RepositoryName, err))
	}

	query := fmt.Sprintf(
		"DELETE FROM %[1]s WHERE %[2]s = $1 AND %[3]s = $2;",
		intdoment.StorageDrivesGroupsAuthorizationIDsRepository().RepositoryName,    //1
		intdoment.StorageDrivesGroupsAuthorizationIDsRepository().StorageDrivesID,   //2
		intdoment.StorageDrivesGroupsAuthorizationIDsRepository().DirectoryGroupsID, //3
	)
	n.logger.Log(ctx, slog.LevelDebug, query, "function", intlib.FunctionName(n.RepoStorageDrivesGroupsDeleteOne))

	if _, err := transaction.Exec(ctx, query, datum.StorageDrivesID[0], datum.DirectoryGroupsID[0]); err == nil {
		query := fmt.Sprintf(
			"DELETE FROM %[1]s WHERE %[2]s = $1 AND %[3]s = $2;",
			intdoment.StorageDrivesGroupsRepository().RepositoryName,    //1
			intdoment.StorageDrivesGroupsRepository().StorageDrivesID,   //2
			intdoment.StorageDrivesGroupsRepository().DirectoryGroupsID, //3
		)
		n.logger.Log(ctx, slog.LevelDebug, query, "function", intlib.FunctionName(n.RepoStorageDrivesGroupsDeleteOne))
		if _, err := transaction.Exec(ctx, query, datum.StorageDrivesID[0], datum.DirectoryGroupsID[0]); err == nil {
			if err := transaction.Commit(ctx); err != nil {
				return intlib.FunctionNameAndError(n.RepoStorageDrivesGroupsDeleteOne, fmt.Errorf("commit transaction to delete %s failed, error: %v", intdoment.StorageDrivesGroupsRepository().RepositoryName, err))
			}
			return nil
		} else {
			transaction.Rollback(ctx)
		}
	}

	transaction, err = n.db.BeginTx(ctx, pgx.TxOptions{})
	if err != nil {
		return intlib.FunctionNameAndError(n.RepoStorageDrivesGroupsDeleteOne, fmt.Errorf("start transaction to deactivate %s failed, error: %v", intdoment.StorageDrivesGroupsRepository().RepositoryName, err))
	}

	query = fmt.Sprintf(
		"UPDATE %[1]s SET %[2]s = $1 WHERE %[3]s = $2 AND %[4]s = $3;",
		intdoment.StorageDrivesGroupsAuthorizationIDsRepository().RepositoryName,                       //1
		intdoment.StorageDrivesGroupsAuthorizationIDsRepository().DeactivationIamGroupAuthorizationsID, //2
		intdoment.StorageDrivesGroupsAuthorizationIDsRepository().StorageDrivesID,                      //3
		intdoment.StorageDrivesGroupsAuthorizationIDsRepository().DirectoryGroupsID,                    //4
	)
	n.logger.Log(ctx, slog.LevelDebug, query, "function", intlib.FunctionName(n.RepoStorageDrivesGroupsDeleteOne))
	if _, err := transaction.Exec(ctx, query, iamAuthRule.ID, datum.StorageDrivesID[0], datum.DirectoryGroupsID[0]); err == nil {
		transaction.Rollback(ctx)
		return intlib.FunctionNameAndError(n.RepoStorageDrivesGroupsDeleteOne, fmt.Errorf("update %s failed, err: %v", intdoment.StorageDrivesGroupsAuthorizationIDsRepository().RepositoryName, err))
	}

	query = fmt.Sprintf(
		"UPDATE %[1]s SET %[2]s = NOW() WHERE %[3]s = $1 AND %[4]s = $2;",
		intdoment.StorageDrivesGroupsRepository().RepositoryName,    //1
		intdoment.StorageDrivesGroupsRepository().DeactivatedOn,     //2
		intdoment.StorageDrivesGroupsRepository().StorageDrivesID,   //3
		intdoment.StorageDrivesGroupsRepository().DirectoryGroupsID, //4
	)
	n.logger.Log(ctx, slog.LevelDebug, query, "function", intlib.FunctionName(n.RepoStorageDrivesGroupsDeleteOne))
	if _, err := transaction.Exec(ctx, query, datum.StorageDrivesID[0], datum.DirectoryGroupsID[0]); err == nil {
		transaction.Rollback(ctx)
		return intlib.FunctionNameAndError(n.RepoStorageDrivesGroupsDeleteOne, fmt.Errorf("update %s failed, err: %v", intdoment.StorageDrivesGroupsRepository().RepositoryName, err))
	}

	if err := transaction.Commit(ctx); err != nil {
		return intlib.FunctionNameAndError(n.RepoStorageDrivesGroupsDeleteOne, fmt.Errorf("commit transaction to update deactivation of %s failed, error: %v", intdoment.StorageDrivesGroupsRepository().RepositoryName, err))
	}

	return nil
}

func (n *PostrgresRepository) RepoStorageDrivesGroupsUpdateOne(ctx context.Context, datum *intdoment.StorageDrivesGroups) error {
	valuesToUpdate := make([]any, 0)
	columnsToUpdate := make([]string, 0)
	if v, c, err := n.RepoStorageDrivesGroupsValidateAndGetColumnsAndData(datum, false); err != nil {
		return err
	} else if len(c) == 0 || len(v) == 0 {
		return intlib.NewError(http.StatusBadRequest, "no values to update")
	} else {
		valuesToUpdate = append(valuesToUpdate, v...)
		columnsToUpdate = append(columnsToUpdate, c...)
	}

	nextPlaceholder := 1
	query := fmt.Sprintf(
		"UPDATE %[1]s SET %[2]s WHERE %[3]s = %[4]s AND %[5]s = %[6]s AND %[7]s IS NULL;",
		intdoment.StorageDrivesGroupsRepository().RepositoryName,    //1
		GetUpdateSetColumns(columnsToUpdate, &nextPlaceholder),      //2
		intdoment.StorageDrivesGroupsRepository().StorageDrivesID,   //3
		GetandUpdateNextPlaceholder(&nextPlaceholder),               //4
		intdoment.StorageDrivesGroupsRepository().DirectoryGroupsID, //5
		GetandUpdateNextPlaceholder(&nextPlaceholder),               //6
		intdoment.StorageDrivesGroupsRepository().DeactivatedOn,     //7
	)
	n.logger.Log(ctx, slog.LevelDebug, query, "function", intlib.FunctionName(n.RepoStorageDrivesGroupsUpdateOne))
	valuesToUpdate = append(valuesToUpdate, datum.StorageDrivesID[0], datum.DirectoryGroupsID[0])

	if _, err := n.db.Exec(ctx, query, valuesToUpdate...); err != nil {
		return intlib.FunctionNameAndError(n.RepoStorageDrivesGroupsUpdateOne, fmt.Errorf("update %s failed, err: %v", intdoment.StorageDrivesGroupsRepository().RepositoryName, err))
	}

	return nil
}

func (n *PostrgresRepository) RepoStorageDrivesGroupsInsertOne(
	ctx context.Context,
	iamAuthRule *intdoment.IamAuthorizationRule,
	datum *intdoment.StorageDrivesGroups,
	columns []string,
) (*intdoment.StorageDrivesGroups, error) {
	storageDrivesGroupsMetadataModel, err := intlib.MetadataModelGet(intdoment.StorageDrivesGroupsRepository().RepositoryName)
	if err != nil {
		return nil, intlib.FunctionNameAndError(n.RepoStorageDrivesGroupsInsertOne, err)
	}

	if len(columns) == 0 {
		if dbColumnFields, err := intlibmmodel.DatabaseGetColumnFields(storageDrivesGroupsMetadataModel, intdoment.StorageDrivesGroupsRepository().RepositoryName, false, false); err != nil {
			return nil, intlib.FunctionNameAndError(n.RepoStorageDrivesGroupsInsertOne, err)
		} else {
			columns = dbColumnFields.ColumnFieldsReadOrder
		}
	}

	if !slices.Contains(columns, intdoment.StorageDrivesGroupsRepository().StorageDrivesID) {
		columns = append(columns, intdoment.StorageDrivesGroupsRepository().StorageDrivesID)
	}

	if !slices.Contains(columns, intdoment.StorageDrivesGroupsRepository().DirectoryGroupsID) {
		columns = append(columns, intdoment.StorageDrivesGroupsRepository().DirectoryGroupsID)
	}

	transaction, err := n.db.BeginTx(ctx, pgx.TxOptions{})
	if err != nil {
		return nil, intlib.FunctionNameAndError(n.RepoStorageDrivesGroupsInsertOne, fmt.Errorf("start transaction to create %s failed, error: %v", intdoment.StorageDrivesGroupsRepository().RepositoryName, err))
	}

	valuesToInsert := make([]any, 0)
	columnsToInsert := make([]string, 0)
	if v, c, err := n.RepoStorageDrivesGroupsValidateAndGetColumnsAndData(datum, true); err != nil {
		return nil, err
	} else if len(c) == 0 || len(v) == 0 {
		return nil, intlib.NewError(http.StatusBadRequest, "no values to insert")
	} else {
		valuesToInsert = append(valuesToInsert, v...)
		columnsToInsert = append(columnsToInsert, c...)
	}

	query := fmt.Sprintf(
		"INSERT INTO %[1]s (%[2]s) VALUES (%[3]s) RETURNING %[4]s;",
		intdoment.StorageDrivesGroupsRepository().RepositoryName,     //1
		strings.Join(columnsToInsert, " , "),                         //2
		GetQueryPlaceholderString(len(valuesToInsert), &[]int{1}[0]), //3
		strings.Join(columns, " , "),                                 //4
	)
	n.logger.Log(ctx, slog.LevelDebug, query, "function", intlib.FunctionName(n.RepoStorageDrivesGroupsInsertOne))

	rows, err := transaction.Query(ctx, query, valuesToInsert...)
	if err != nil {
		transaction.Rollback(ctx)
		return nil, intlib.FunctionNameAndError(n.RepoStorageDrivesGroupsInsertOne, fmt.Errorf("insert %s failed, err: %v", intdoment.StorageDrivesGroupsRepository().RepositoryName, err))
	}

	defer rows.Close()
	dataRows := make([]any, 0)
	for rows.Next() {
		if r, err := rows.Values(); err != nil {
			transaction.Rollback(ctx)
			return nil, intlib.FunctionNameAndError(n.RepoStorageDrivesGroupsInsertOne, err)
		} else {
			dataRows = append(dataRows, r)
		}
	}

	array2DToObject, err := intlibmmodel.NewConvert2DArrayToObjects(storageDrivesGroupsMetadataModel, nil, false, false, columns)
	if err != nil {
		transaction.Rollback(ctx)
		return nil, intlib.FunctionNameAndError(n.RepoStorageDrivesGroupsInsertOne, err)
	}
	if err := array2DToObject.Convert(dataRows); err != nil {
		transaction.Rollback(ctx)
		return nil, intlib.FunctionNameAndError(n.RepoStorageDrivesGroupsInsertOne, err)
	}

	if len(array2DToObject.Objects()) == 0 {
		transaction.Rollback(ctx)
		return nil, fmt.Errorf("insert %s did not return any row", intdoment.StorageDrivesGroupsRepository().RepositoryName)
	}

	if len(array2DToObject.Objects()) > 1 {
		transaction.Rollback(ctx)
		n.logger.Log(ctx, slog.LevelError, fmt.Sprintf("length of array2DToObject.Objects(): %v", len(array2DToObject.Objects())), "function", intlib.FunctionName(n.RepoStorageDrivesGroupsInsertOne))
		return nil, intlib.FunctionNameAndError(n.RepoStorageDrivesGroupsInsertOne, fmt.Errorf("more than one %s found", intdoment.StorageDrivesGroupsRepository().RepositoryName))
	}

	storageDriveGroup := new(intdoment.StorageDrivesGroups)
	if jsonData, err := json.Marshal(array2DToObject.Objects()[0]); err != nil {
		transaction.Rollback(ctx)
		return nil, intlib.FunctionNameAndError(n.RepoStorageDrivesGroupsInsertOne, err)
	} else {
		n.logger.Log(ctx, slog.LevelDebug, "json parsing storageDriveGroup", "storageDriveGroup", string(jsonData), "function", intlib.FunctionName(n.RepoStorageDrivesGroupsInsertOne))
		if err := json.Unmarshal(jsonData, storageDriveGroup); err != nil {
			transaction.Rollback(ctx)
			return nil, intlib.FunctionNameAndError(n.RepoStorageDrivesGroupsInsertOne, err)
		}
	}

	query = fmt.Sprintf(
		"INSERT INTO %[1]s (%[2]s, %[3]s, %[4]s) VALUES ($1, $2, $3);",
		intdoment.StorageDrivesGroupsAuthorizationIDsRepository().RepositoryName,                   //1
		intdoment.StorageDrivesGroupsAuthorizationIDsRepository().StorageDrivesID,                  //2
		intdoment.StorageDrivesGroupsAuthorizationIDsRepository().DirectoryGroupsID,                //3
		intdoment.StorageDrivesGroupsAuthorizationIDsRepository().CreationIamGroupAuthorizationsID, //4
	)
	n.logger.Log(ctx, slog.LevelDebug, query, "function", intlib.FunctionName(n.RepoStorageDrivesGroupsInsertOne))

	if _, err := transaction.Exec(ctx, query, storageDriveGroup.StorageDrivesID[0], storageDriveGroup.DirectoryGroupsID[0], iamAuthRule.ID); err != nil {
		transaction.Rollback(ctx)
		return nil, intlib.FunctionNameAndError(n.RepoStorageDrivesGroupsInsertOne, fmt.Errorf("insert %s failed, err: %v", intdoment.StorageDrivesGroupsAuthorizationIDsRepository().RepositoryName, err))
	}

	if err := transaction.Commit(ctx); err != nil {
		return nil, intlib.FunctionNameAndError(n.RepoStorageDrivesGroupsInsertOne, fmt.Errorf("commit transaction to create %s failed, error: %v", intdoment.StorageDrivesGroupsRepository().RepositoryName, err))
	}

	return storageDriveGroup, nil
}

func (n *PostrgresRepository) RepoStorageDrivesGroupsValidateAndGetColumnsAndData(datum *intdoment.StorageDrivesGroups, insert bool) ([]any, []string, error) {
	values := make([]any, 0)
	columns := make([]string, 0)

	if insert {
		if len(datum.StorageDrivesID) == 0 {
			return nil, nil, fmt.Errorf("%s is not valid", intdoment.StorageDrivesGroupsRepository().StorageDrivesID)
		} else {
			values = append(values, datum.StorageDrivesID[0])
			columns = append(columns, intdoment.StorageDrivesGroupsRepository().StorageDrivesID)
		}

		if len(datum.DirectoryGroupsID) == 0 {
			return nil, nil, fmt.Errorf("%s is not valid", intdoment.StorageDrivesGroupsRepository().DirectoryGroupsID)
		} else {
			values = append(values, datum.DirectoryGroupsID[0])
			columns = append(columns, intdoment.StorageDrivesGroupsRepository().DirectoryGroupsID)
		}
	}

	if len(datum.Description) > 0 && len(datum.Description[0]) > 0 {
		values = append(values, datum.Description[0])
		columns = append(columns, intdoment.StorageDrivesGroupsRepository().Description)
	}

	return values, columns, nil
}

func (n *PostrgresRepository) RepoStorageDrivesGroupsSearch(
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
	selectQuery, err := pSelectQuery.StorageDrivesGroupsGetSelectQuery(ctx, mmsearch.MetadataModel, "")
	if err != nil {
		return nil, intlib.FunctionNameAndError(n.RepoStorageDrivesGroupsSearch, err)
	}

	query, selectQueryExtract := GetSelectQuery(selectQuery, whereAfterJoin)
	n.logger.Log(ctx, slog.LevelDebug, query, "function", intlib.FunctionName(n.RepoStorageDrivesGroupsSearch))

	rows, err := n.db.Query(ctx, query)
	if err != nil {
		return nil, intlib.FunctionNameAndError(n.RepoStorageDrivesGroupsSearch, fmt.Errorf("retrieve %s failed, err: %v", intdoment.StorageDrivesGroupsRepository().RepositoryName, err))
	}
	defer rows.Close()
	dataRows := make([]any, 0)
	for rows.Next() {
		if r, err := rows.Values(); err != nil {
			return nil, intlib.FunctionNameAndError(n.RepoStorageDrivesGroupsSearch, err)
		} else {
			dataRows = append(dataRows, r)
		}
	}

	array2DToObject, err := intlibmmodel.NewConvert2DArrayToObjects(mmsearch.MetadataModel, selectQueryExtract.Fields, false, false, nil)
	if err != nil {
		return nil, intlib.FunctionNameAndError(n.RepoStorageDrivesGroupsSearch, err)
	}
	if err := array2DToObject.Convert(dataRows); err != nil {
		return nil, intlib.FunctionNameAndError(n.RepoStorageDrivesGroupsSearch, err)
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

func (n *PostgresSelectQuery) StorageDrivesGroupsGetSelectQuery(ctx context.Context, metadataModel map[string]any, metadataModelParentPath string) (*SelectQuery, error) {
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

	quoteColumns := true
	if len(metadataModelParentPath) == 0 {
		metadataModelParentPath = "$"
		quoteColumns = false
	}
	if !n.whereAfterJoin {
		quoteColumns = false
	}

	selectQuery := SelectQuery{
		TableName: intdoment.StorageDrivesGroupsRepository().RepositoryName,
		Query:     "",
		Where:     make(map[string]map[int][][]string),
		Join:      make(map[string]*SelectQuery),
		JoinQuery: make([]string, 0),
	}

	if tableUid, ok := metadataModel[intlibmmodel.FIELD_GROUP_PROP_DATABASE_TABLE_COLLECTION_UID].(string); ok && len(tableUid) > 0 {
		selectQuery.TableUid = tableUid
	} else {
		return nil, intlib.FunctionNameAndError(n.StorageDrivesGroupsGetSelectQuery, errors.New("tableUid is empty"))
	}

	if value, err := intlibmmodel.DatabaseGetColumnFields(metadataModel, selectQuery.TableUid, false, false); err != nil {
		return nil, intlib.FunctionNameAndError(n.StorageDrivesGroupsGetSelectQuery, fmt.Errorf("extract database column fields failed, error: %v", err))
	} else {
		selectQuery.Columns = value
	}

	if _, ok := selectQuery.Columns.Fields[intdoment.StorageDrivesGroupsRepository().StorageDrivesID][intlibmmodel.FIELD_GROUP_PROP_FIELD_GROUP_KEY].(string); ok {
		if value := n.getWhereCondition(quoteColumns, selectQuery.TableUid, "", intdoment.StorageDrivesGroupsRepository().StorageDrivesID, "", PROCESS_QUERY_CONDITION_AS_SINGLE_VALUE, ""); len(value) > 0 {
			selectQuery.Where[intdoment.StorageDrivesGroupsRepository().StorageDrivesID] = value
		}
	}
	if _, ok := selectQuery.Columns.Fields[intdoment.StorageDrivesGroupsRepository().DirectoryGroupsID][intlibmmodel.FIELD_GROUP_PROP_FIELD_GROUP_KEY].(string); ok {
		if value := n.getWhereCondition(quoteColumns, selectQuery.TableUid, "", intdoment.StorageDrivesGroupsRepository().DirectoryGroupsID, "", PROCESS_QUERY_CONDITION_AS_SINGLE_VALUE, ""); len(value) > 0 {
			selectQuery.Where[intdoment.StorageDrivesGroupsRepository().DirectoryGroupsID] = value
		}
	}
	if _, ok := selectQuery.Columns.Fields[intdoment.StorageDrivesGroupsRepository().Description][intlibmmodel.FIELD_GROUP_PROP_FIELD_GROUP_KEY].(string); ok {
		if value := n.getWhereCondition(quoteColumns, selectQuery.TableUid, "", intdoment.StorageDrivesGroupsRepository().Description, "", PROCESS_QUERY_CONDITION_AS_SINGLE_VALUE, ""); len(value) > 0 {
			selectQuery.Where[intdoment.StorageDrivesGroupsRepository().Description] = value
		}
	}
	if _, ok := selectQuery.Columns.Fields[intdoment.StorageDrivesGroupsRepository().CreatedOn][intlibmmodel.FIELD_GROUP_PROP_FIELD_GROUP_KEY].(string); ok {
		if value := n.getWhereCondition(quoteColumns, selectQuery.TableUid, "", intdoment.StorageDrivesGroupsRepository().CreatedOn, "", PROCESS_QUERY_CONDITION_AS_SINGLE_VALUE, ""); len(value) > 0 {
			selectQuery.Where[intdoment.StorageDrivesGroupsRepository().CreatedOn] = value
		}
	}
	if _, ok := selectQuery.Columns.Fields[intdoment.StorageDrivesGroupsRepository().LastUpdatedOn][intlibmmodel.FIELD_GROUP_PROP_FIELD_GROUP_KEY].(string); ok {
		if value := n.getWhereCondition(quoteColumns, selectQuery.TableUid, "", intdoment.StorageDrivesGroupsRepository().LastUpdatedOn, "", PROCESS_QUERY_CONDITION_AS_SINGLE_VALUE, ""); len(value) > 0 {
			selectQuery.Where[intdoment.StorageDrivesGroupsRepository().LastUpdatedOn] = value
		}
	}
	if _, ok := selectQuery.Columns.Fields[intdoment.StorageDrivesGroupsRepository().DeactivatedOn][intlibmmodel.FIELD_GROUP_PROP_FIELD_GROUP_KEY].(string); ok {
		if value := n.getWhereCondition(quoteColumns, selectQuery.TableUid, "", intdoment.StorageDrivesGroupsRepository().DeactivatedOn, "", PROCESS_QUERY_CONDITION_AS_SINGLE_VALUE, ""); len(value) > 0 {
			selectQuery.Where[intdoment.StorageDrivesGroupsRepository().DeactivatedOn] = value
		}
	}

	storageDrivesIDJoinStorageDrives := intlib.MetadataModelGenJoinKey(intdoment.StorageDrivesGroupsRepository().StorageDrivesID, intdoment.StorageDrivesRepository().RepositoryName)
	if value, err := n.extractChildMetadataModel(metadataModel, storageDrivesIDJoinStorageDrives); err != nil {
		n.logger.Log(ctx, slog.LevelDebug, fmt.Sprintf("extract %s child metadata model failed, error: %v", storageDrivesIDJoinStorageDrives, err))
	} else {
		if sq, err := n.StorageDrivesGetSelectQuery(
			ctx,
			value,
			metadataModelParentPath,
		); err != nil {
			n.logger.Log(ctx, slog.LevelDebug, fmt.Sprintf("get child %s psql query failed, error: %v", storageDrivesIDJoinStorageDrives, err))
		} else {
			sq.JoinType = JOIN_INNER
			sq.JoinQuery = make([]string, 1)
			sq.JoinQuery[0] = fmt.Sprintf(
				"%[1]s = %[2]s",
				GetJoinColumnName(sq.TableUid, intdoment.StorageDrivesRepository().ID, true),                              //1
				GetJoinColumnName(selectQuery.TableUid, intdoment.StorageDrivesGroupsRepository().StorageDrivesID, false), //2
			)

			selectQuery.Join[storageDrivesIDJoinStorageDrives] = sq
		}
	}

	directoryGroupsIDJoinDirectoryGroups := intlib.MetadataModelGenJoinKey(intdoment.StorageDrivesGroupsRepository().DirectoryGroupsID, intdoment.DirectoryGroupsRepository().RepositoryName)
	if value, err := n.extractChildMetadataModel(metadataModel, directoryGroupsIDJoinDirectoryGroups); err != nil {
		n.logger.Log(ctx, slog.LevelDebug, fmt.Sprintf("extract %s child metadata model failed, error: %v", directoryGroupsIDJoinDirectoryGroups, err))
	} else {
		if sq, err := n.DirectoryGroupsGetSelectQuery(
			ctx,
			value,
			metadataModelParentPath,
		); err != nil {
			n.logger.Log(ctx, slog.LevelDebug, fmt.Sprintf("get child %s psql query failed, error: %v", directoryGroupsIDJoinDirectoryGroups, err))
		} else {
			sq.JoinType = JOIN_INNER
			sq.JoinQuery = make([]string, 1)
			sq.JoinQuery[0] = fmt.Sprintf(
				"%[1]s = %[2]s",
				GetJoinColumnName(sq.TableUid, intdoment.DirectoryGroupsRepository().ID, true),                              //1
				GetJoinColumnName(selectQuery.TableUid, intdoment.StorageDrivesGroupsRepository().DirectoryGroupsID, false), //2
			)

			selectQuery.Join[directoryGroupsIDJoinDirectoryGroups] = sq
		}
	}

	storageDrivesGroupsJoinStorageDrivesGroupsAuthorizationIDs := intlib.MetadataModelGenJoinKey(intdoment.StorageDrivesGroupsRepository().RepositoryName, intdoment.StorageDrivesGroupsAuthorizationIDsRepository().RepositoryName)
	if value, err := n.extractChildMetadataModel(metadataModel, storageDrivesGroupsJoinStorageDrivesGroupsAuthorizationIDs); err != nil {
		n.logger.Log(ctx, slog.LevelDebug, fmt.Sprintf("extract %s child metadata model failed, error: %v", storageDrivesGroupsJoinStorageDrivesGroupsAuthorizationIDs, err))
	} else {
		if sq, err := n.AuthorizationIDsGetSelectQuery(
			ctx,
			value,
			metadataModelParentPath,
			intdoment.StorageDrivesGroupsAuthorizationIDsRepository().RepositoryName,
			[]AuthIDsSelectQueryPKey{{Name: intdoment.StorageDrivesGroupsAuthorizationIDsRepository().StorageDrivesID, ProcessAs: PROCESS_QUERY_CONDITION_AS_SINGLE_VALUE}, {Name: intdoment.StorageDrivesGroupsAuthorizationIDsRepository().DirectoryGroupsID, ProcessAs: PROCESS_QUERY_CONDITION_AS_SINGLE_VALUE}},
			intdoment.StorageDrivesGroupsAuthorizationIDsRepository().CreationIamGroupAuthorizationsID,
			intdoment.StorageDrivesGroupsAuthorizationIDsRepository().DeactivationIamGroupAuthorizationsID,
		); err != nil {
			n.logger.Log(ctx, slog.LevelDebug, fmt.Sprintf("get child %s psql query failed, error: %v", storageDrivesGroupsJoinStorageDrivesGroupsAuthorizationIDs, err))
		} else {
			sq.JoinType = JOIN_INNER
			sq.JoinQuery = make([]string, 1)
			sq.JoinQuery[0] = fmt.Sprintf(
				"%[1]s = %[2]s AND %[3]s = %[4]s",
				GetJoinColumnName(sq.TableUid, intdoment.StorageDrivesGroupsAuthorizationIDsRepository().StorageDrivesID, true),   //1
				GetJoinColumnName(selectQuery.TableUid, intdoment.StorageDrivesGroupsRepository().StorageDrivesID, false),         //2
				GetJoinColumnName(sq.TableUid, intdoment.StorageDrivesGroupsAuthorizationIDsRepository().DirectoryGroupsID, true), //3
				GetJoinColumnName(selectQuery.TableUid, intdoment.StorageDrivesGroupsRepository().DirectoryGroupsID, false),       //4
			)

			selectQuery.Join[storageDrivesGroupsJoinStorageDrivesGroupsAuthorizationIDs] = sq
		}
	}

	selectQuery.appendSort()
	selectQuery.appendLimitOffset(metadataModel)

	return &selectQuery, nil
}
