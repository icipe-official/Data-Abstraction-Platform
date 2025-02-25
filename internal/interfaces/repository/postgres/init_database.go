package postgres

import (
	"context"
	"encoding/json"
	"fmt"
	"log/slog"
	"slices"
	"strings"

	"github.com/go-chi/httplog/v2"
	intdoment "github.com/icipe-official/Data-Abstraction-Platform/internal/domain/entities"
	intlib "github.com/icipe-official/Data-Abstraction-Platform/internal/lib"
	intlibmmodel "github.com/icipe-official/Data-Abstraction-Platform/internal/lib/metadata_model"
	"github.com/jackc/pgx/v5"
)

func (n *PostrgresRepository) RepoDirectoryGroupsCreateSystemGroup(ctx context.Context, logger *httplog.Logger, columns []string) (*intdoment.DirectoryGroups, error) {
	directoryGroupsMModel, err := intlib.MetadataModelGetDatum(intdoment.DirectoryGroupsRepository().RepositoryName)
	if err != nil {
		return nil, intlib.FunctionNameAndError(n.RepoDirectoryGroupsFindSystemGroup, err)
	}

	if len(columns) == 0 {
		if dbColumnFields, err := intlibmmodel.DatabaseGetColumnFields(directoryGroupsMModel, intdoment.DirectoryGroupsRepository().RepositoryName, intdoment.DirectoryGroupsRepository().RepositoryName, false, false); err != nil {
			return nil, intlib.FunctionNameAndError(n.RepoDirectoryGroupsFindSystemGroup, err)
		} else {
			columns = dbColumnFields.ColumnFieldsReadOrder
		}
	}

	if !slices.Contains(columns, intdoment.DirectoryGroupsRepository().ID) {
		columns = append(columns, intdoment.DirectoryGroupsRepository().ID)
	}

	transaction, err := n.db.BeginTx(ctx, pgx.TxOptions{})
	if err != nil {
		return nil, intlib.FunctionNameAndError(n.RepoDirectoryGroupsCreateSystemGroup, fmt.Errorf("start transaction to create system group failed, error: %v", err))
	}

	query := fmt.Sprintf(
		"INSERT INTO %[1]s (%[2]s) VALUES (NULL) RETURNING %[3]s;",
		intdoment.DirectoryGroupsRepository().RepositoryName, //1
		intdoment.DirectoryGroupsRepository().Data,           //2
		strings.Join(columns, ","),                           //3
	)
	logger.Log(ctx, slog.LevelDebug, "query", query)

	rows, err := transaction.Query(ctx, query)
	if err != nil {
		return nil, intlib.FunctionNameAndError(n.RepoDirectoryGroupsCreateSystemGroup, fmt.Errorf("insert system %s failed, err: %v", intdoment.DirectoryGroupsRepository().RepositoryName, err))
	}
	defer rows.Close()
	dataRows := make([]any, 0)
	for rows.Next() {
		if r, err := rows.Values(); err != nil {
			return nil, intlib.FunctionNameAndError(n.RepoDirectoryGroupsCreateSystemGroup, err)
		} else {
			dataRows = append(dataRows, r)
		}
	}
	if len(dataRows) < 1 {
		transaction.Rollback(ctx)
		return nil, intlib.FunctionNameAndError(n.RepoDirectoryGroupsCreateSystemGroup, fmt.Errorf("%v data is empty", intdoment.DirectoryGroupsRepository().RepositoryName))
	}

	array2DToObject, err := intlibmmodel.NewConvert2DArrayToObjects(directoryGroupsMModel, nil, false, false, columns)
	if err != nil {
		transaction.Rollback(ctx)
		return nil, intlib.FunctionNameAndError(n.RepoDirectoryGroupsCreateSystemGroup, err)
	}
	if err := array2DToObject.Convert(dataRows); err != nil {
		transaction.Rollback(ctx)
		return nil, intlib.FunctionNameAndError(n.RepoDirectoryGroupsCreateSystemGroup, err)
	}
	systemGroup := new(intdoment.DirectoryGroups)
	if jsonData, err := json.Marshal(array2DToObject.Objects()[0]); err != nil {
		transaction.Rollback(ctx)
		return nil, err
	} else {
		if err := json.Unmarshal(jsonData, systemGroup); err != nil {
			transaction.Rollback(ctx)
			return nil, err
		}
	}

	groupAuthorizationRulesMModel, err := intlib.MetadataModelGetDatum(intdoment.GroupAuthorizationRulesRepository().RepositoryName)
	if err != nil {
		return nil, intlib.FunctionNameAndError(n.RepoDirectoryGroupsFindSystemGroup, err)
	}
	columns = []string{intdoment.GroupAuthorizationRulesRepository().ID, intdoment.GroupAuthorizationRulesRepository().RuleGroup}
	query = fmt.Sprintf(
		"SELECT %[1]s, %[2]s FROM %[3]s WHERE %[2]s = $1 OR %[2]s = $2 OR %[2]s = $3 OR %[2]s = $4 OR %[2]s = $5;",
		intdoment.GroupAuthorizationRulesRepository().ID,             //1
		intdoment.GroupAuthorizationRulesRepository().RuleGroup,      //2
		intdoment.GroupAuthorizationRulesRepository().RepositoryName, //3
	)
	logger.Log(ctx, slog.LevelDebug, "query", query)

	rows, err = transaction.Query(ctx, query, intdoment.AUTH_RULE_GROUP_GROUP_RULE_AUTHORIZATION, intdoment.AUTH_RULE_GROUP_IAM_GROUP_AUTHORIZATION, intdoment.AUTH_RULE_GROUP_DIRECTORY, intdoment.AUTH_RULE_GROUP_IAM_CREDENTIALS, intdoment.AUTH_RULE_GROUP_DIRECTORY_GROUPS)
	if err != nil {
		transaction.Rollback(ctx)
		return nil, intlib.FunctionNameAndError(n.RepoDirectoryGroupsFindSystemGroup, fmt.Errorf("retrieve %s failed, err: %v", intdoment.GroupAuthorizationRulesRepository().RepositoryName, err))
	}
	defer rows.Close()
	dataRows = make([]any, 0)
	for rows.Next() {
		if r, err := rows.Values(); err != nil {
			transaction.Rollback(ctx)
			return nil, intlib.FunctionNameAndError(n.RepoDirectoryGroupsFindSystemGroup, err)
		} else {
			dataRows = append(dataRows, r)
		}
	}
	if len(dataRows) < 1 {
		transaction.Rollback(ctx)
		return nil, intlib.FunctionNameAndError(n.RepoDirectoryGroupsCreateSystemGroup, fmt.Errorf("%v data is empty", intdoment.GroupAuthorizationRulesRepository().RepositoryName))
	}

	array2DToObject, err = intlibmmodel.NewConvert2DArrayToObjects(groupAuthorizationRulesMModel, nil, false, false, columns)
	if err != nil {
		transaction.Rollback(ctx)
		return nil, intlib.FunctionNameAndError(n.RepoDirectoryGroupsCreateSystemGroup, err)
	}
	if err := array2DToObject.Convert(dataRows); err != nil {
		transaction.Rollback(ctx)
		return nil, intlib.FunctionNameAndError(n.RepoDirectoryGroupsCreateSystemGroup, err)
	}
	groupAuthorizationRules := make([]intdoment.GroupAuthorizationRules, 0)
	if jsonData, err := json.Marshal(array2DToObject.Objects()); err != nil {
		transaction.Rollback(ctx)
		return nil, intlib.FunctionNameAndError(n.RepoDirectoryGroupsCreateSystemGroup, err)
	} else {
		if err := json.Unmarshal(jsonData, &groupAuthorizationRules); err != nil {
			transaction.Rollback(ctx)
			return nil, intlib.FunctionNameAndError(n.RepoDirectoryGroupsCreateSystemGroup, err)
		}
	}

	for _, gar := range groupAuthorizationRules {
		query = fmt.Sprintf(
			"SELECT * FROM %[1]s WHERE %[2]s = $1 AND %[3]s = $2 AND %[4]s = $3;",
			intdoment.GroupRuleAuthorizationRepository().RepositoryName,               //1
			intdoment.GroupRuleAuthorizationRepository().DirectoryGroupsID,            //2
			intdoment.GroupRuleAuthorizationRepository().GroupAuthorizationsRuleID,    //3
			intdoment.GroupRuleAuthorizationRepository().GroupAuthorizationsRuleGroup, //4
		)
		logger.Log(ctx, slog.LevelDebug, "query", query)

		if rows := transaction.QueryRow(
			ctx,
			query,
			systemGroup.ID[0],
			gar.GroupAuthorizationRulesID[0].ID[0],
			gar.GroupAuthorizationRulesID[0].RuleGroup[0],
		); rows.Scan() == pgx.ErrNoRows {
			query = fmt.Sprintf(
				"INSERT INTO %[1]s (%[2]s, %[3]s, %[4]s) VALUES ($1, $2, $3);",
				intdoment.GroupRuleAuthorizationRepository().RepositoryName,               //1
				intdoment.GroupRuleAuthorizationRepository().DirectoryGroupsID,            //2
				intdoment.GroupRuleAuthorizationRepository().GroupAuthorizationsRuleID,    //3
				intdoment.GroupRuleAuthorizationRepository().GroupAuthorizationsRuleGroup, //4
			)
			logger.Log(ctx, slog.LevelDebug, "query", query)

			if _, err := transaction.Exec(ctx, query, systemGroup.ID[0], gar.GroupAuthorizationRulesID[0].ID[0], gar.GroupAuthorizationRulesID[0].RuleGroup[0]); err != nil {
				transaction.Rollback(ctx)
				return nil, intlib.FunctionNameAndError(n.RepoDirectoryGroupsCreateSystemGroup, fmt.Errorf("insert %s failed, err: %v", intdoment.GroupRuleAuthorizationRepository().RepositoryName, err))
			}
		} else {
			transaction.Rollback(ctx)
			return nil, intlib.FunctionNameAndError(n.RepoDirectoryGroupsCreateSystemGroup, fmt.Errorf("get individual %s failed, err: %v", intdoment.GroupRuleAuthorizationRepository().RepositoryName, rows.Scan()))
		}
	}

	if err := transaction.Commit(ctx); err != nil {
		return nil, intlib.FunctionNameAndError(n.RepoDirectoryGroupsCreateSystemGroup, fmt.Errorf("commit transaction to create system group failed, error: %v", err))
	}

	return systemGroup, nil
}

func (n *PostrgresRepository) RepoDirectoryGroupsFindSystemGroup(ctx context.Context, logger *httplog.Logger, columns []string) (*intdoment.DirectoryGroups, error) {
	directoryGroupsMetadataModel, err := intlib.MetadataModelGetDatum(intdoment.DirectoryGroupsRepository().RepositoryName)
	if err != nil {
		return nil, intlib.FunctionNameAndError(n.RepoDirectoryGroupsFindSystemGroup, err)
	}

	if len(columns) == 0 {
		if dbColumnFields, err := intlibmmodel.DatabaseGetColumnFields(directoryGroupsMetadataModel, intdoment.DirectoryGroupsRepository().RepositoryName, intdoment.DirectoryGroupsRepository().RepositoryName, false, false); err != nil {
			return nil, intlib.FunctionNameAndError(n.RepoDirectoryGroupsFindSystemGroup, err)
		} else {
			columns = dbColumnFields.ColumnFieldsReadOrder
		}
	}

	query := fmt.Sprintf(
		"SELECT %[1]s FROM %[2]s WHERE %[3]s IS NULL;",
		strings.Join(columns, ","),                           //1
		intdoment.DirectoryGroupsRepository().RepositoryName, //2
		intdoment.DirectoryGroupsRepository().Data,           //3
	)
	logger.Log(ctx, slog.LevelDebug, "query", query)

	rows, err := n.db.Query(ctx, query)
	if err != nil {
		return nil, intlib.FunctionNameAndError(n.RepoDirectoryGroupsFindSystemGroup, fmt.Errorf("retrieve system %s failed, err: %v", intdoment.DirectoryGroupsRepository().RepositoryName, err))
	}
	defer rows.Close()
	dataRows := make([]any, 0)
	for rows.Next() {
		if r, err := rows.Values(); err != nil {
			return nil, err
		} else {
			dataRows = append(dataRows, r)
		}
	}

	array2DToObject, err := intlibmmodel.NewConvert2DArrayToObjects(directoryGroupsMetadataModel, nil, false, false, columns)
	if err != nil {
		return nil, err
	}
	if err := array2DToObject.Convert(dataRows); err != nil {
		return nil, err
	}

	if len(array2DToObject.Objects()) == 0 {
		return nil, nil
	}

	if len(array2DToObject.Objects()) > 1 {
		logger.Log(ctx, slog.LevelError, "length of array2DToObject.Objects()", len(array2DToObject.Objects()))
		return nil, intlib.FunctionNameAndError(n.RepoDirectoryGroupsFindSystemGroup, fmt.Errorf("more than one system %s found", intdoment.DirectoryGroupsRepository().RepositoryName))
	}

	systemGroup := new(intdoment.DirectoryGroups)
	if jsonData, err := json.Marshal(array2DToObject.Objects()[0]); err != nil {
		return nil, err
	} else {
		logger.Log(ctx, slog.LevelDebug, "systemGroup", systemGroup)
		if err := json.Unmarshal(jsonData, systemGroup); err != nil {
			return nil, err
		}
	}

	return systemGroup, nil
}

func (n *PostrgresRepository) RepoStorageTypesInsertOne(ctx context.Context, logger *httplog.Logger, data *intdoment.StorageDrivesTypes) error {
	query := fmt.Sprintf(
		"INSERT INTO %[1]s (%[2]s, %[3]s) VALUES ($1, $2) ON CONFLICT (%[2]s) DO UPDATE SET %[3]s = $2;",
		intdoment.StorageDrivesTypesRepository().RepositoryName, //1
		intdoment.StorageDrivesTypesRepository().ID,             //2
		intdoment.StorageDrivesTypesRepository().Description,    //3
	)
	logger.Log(ctx, slog.LevelDebug, "query", query)

	if _, err := n.db.Exec(ctx, query, data.ID[0], data.Description[0]); err != nil {
		return fmt.Errorf("insert storage_drive_type failed, err: %v", err)
	}

	return nil
}

func (n *PostrgresRepository) RepoGroupAuthorizationRulesInsertMany(ctx context.Context, logger *httplog.Logger, data []intdoment.GroupAuthorizationRules) (int, error) {
	query := fmt.Sprintf(
		"INSERT INTO %[1]s (%[2]s, %[3]s, %[4]s) VALUES ($1, $2, $3) ON CONFLICT(%[2]s, %[3]s) DO UPDATE SET %[4]s = $3;",
		intdoment.GroupAuthorizationRulesRepository().RepositoryName, //1
		intdoment.GroupAuthorizationRulesRepository().ID,             //2
		intdoment.GroupAuthorizationRulesRepository().RuleGroup,      //3
		intdoment.GroupAuthorizationRulesRepository().Description,    //4
	)
	logger.Log(ctx, slog.LevelDebug, "query", query)

	successfulUpserts := 0
	for _, datum := range data {
		if _, err := n.db.Exec(ctx, query, datum.GroupAuthorizationRulesID[0].ID[0], datum.GroupAuthorizationRulesID[0].RuleGroup[0], datum.Description[0]); err != nil {
			return successfulUpserts, err
		}
		successfulUpserts += 1
	}

	return successfulUpserts, nil
}

func (n *PostrgresRepository) RepoMetadataModelDefaultsInsertMany(ctx context.Context, logger *httplog.Logger, data []intdoment.MetadataModelsDefaults) (int, error) {
	query := fmt.Sprintf(
		"INSERT INTO %[1]s (%[2]s, %[3]s) VALUES ($1, $2) ON CONFLICT (%[2]s) DO UPDATE SET %[3]s = $2;",
		intdoment.MetadataModelsDefaultsRepository().RepositoryName, //1
		intdoment.MetadataModelsDefaultsRepository().ID,             //2
		intdoment.MetadataModelsDefaultsRepository().Description,    //3
	)
	logger.Log(ctx, slog.LevelDebug, "query", query)

	successfulUpserts := 0
	for _, datum := range data {
		_, err := n.db.Exec(ctx, query, datum.ID[0], datum.Description[0])
		if err != nil && err != pgx.ErrNoRows {
			return successfulUpserts, fmt.Errorf("insert metadata_model_defaults failed, err: %v", err)
		}
		successfulUpserts += 1
	}

	return successfulUpserts, nil
}
