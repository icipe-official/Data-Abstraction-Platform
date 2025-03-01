package postgres

import (
	"context"
	"encoding/json"
	"fmt"
	"log/slog"
	"slices"
	"strings"

	"github.com/gofrs/uuid/v5"
	intdoment "github.com/icipe-official/Data-Abstraction-Platform/internal/domain/entities"
	intlib "github.com/icipe-official/Data-Abstraction-Platform/internal/lib"
	intlibmmodel "github.com/icipe-official/Data-Abstraction-Platform/internal/lib/metadata_model"
	"github.com/jackc/pgx/v5"
)

func (n *PostrgresRepository) RepoDirectoryGroupsFindOneByIamCredentialID(ctx context.Context, iamCredentialID uuid.UUID, columns []string) (*intdoment.DirectoryGroups, error) {
	directoryGroupsMModel, err := intlib.MetadataModelGetDatum(intdoment.DirectoryGroupsRepository().RepositoryName)
	if err != nil {
		return nil, intlib.FunctionNameAndError(n.RepoDirectoryGroupsFindOneByIamCredentialID, err)
	}

	if len(columns) == 0 {
		if dbColumnFields, err := intlibmmodel.DatabaseGetColumnFields(directoryGroupsMModel, intdoment.DirectoryGroupsRepository().RepositoryName, false, false); err != nil {
			return nil, intlib.FunctionNameAndError(n.RepoDirectoryGroupsFindOneByIamCredentialID, err)
		} else {
			columns = make([]string, len(dbColumnFields.ColumnFieldsReadOrder))
			for cIndex, cValue := range dbColumnFields.ColumnFieldsReadOrder {
				columns[cIndex] = fmt.Sprintf("%s.%s", intdoment.DirectoryGroupsRepository().RepositoryName, cValue)
			}
		}
	}

	if !slices.Contains(columns, fmt.Sprintf("%s.%s", intdoment.DirectoryGroupsRepository().RepositoryName, intdoment.DirectoryGroupsRepository().ID)) {
		columns = append(columns, fmt.Sprintf("%s.%s", intdoment.DirectoryGroupsRepository().RepositoryName, intdoment.DirectoryGroupsRepository().ID))
	}

	query := fmt.Sprintf(
		"SELECT %[1]s FROM %[2]s INNER JOIN %[3]s INNER JOIN %[4]s ON %[4]s.%[5]s = $1 AND %[4]s.%[6]s = %[3]s.%[7]s ON %[3]s.%[8]s = %[2]s.%[9]s;",
		strings.Join(columns, ","),                           //1
		intdoment.DirectoryGroupsRepository().RepositoryName, //2
		intdoment.DirectoryRepository().RepositoryName,       //3
		intdoment.IamCredentialsRepository().RepositoryName,  //4
		intdoment.IamCredentialsRepository().ID,              //5
		intdoment.IamCredentialsRepository().DirectoryID,     //6
		intdoment.DirectoryRepository().ID,                   //7
		intdoment.DirectoryRepository().DirectoryGroupsID,    //8
		intdoment.DirectoryGroupsRepository().ID,             //9
	)
	n.logger.Log(ctx, slog.LevelDebug, query, "function", intlib.FunctionName(n.RepoDirectoryGroupsFindOneByIamCredentialID))

	rows, err := n.db.Query(ctx, query, iamCredentialID)
	if err != nil {
		return nil, intlib.FunctionNameAndError(n.RepoDirectoryGroupsFindOneByIamCredentialID, fmt.Errorf("retrieve %s failed, err: %v", intdoment.DirectoryGroupsRepository().RepositoryName, err))
	}
	defer rows.Close()
	dataRows := make([]any, 0)
	for rows.Next() {
		if r, err := rows.Values(); err != nil {
			return nil, intlib.FunctionNameAndError(n.RepoDirectoryGroupsFindOneByIamCredentialID, err)
		} else {
			dataRows = append(dataRows, r)
		}
	}

	array2DToObject, err := intlibmmodel.NewConvert2DArrayToObjects(directoryGroupsMModel, nil, false, false, columns)
	if err != nil {
		return nil, intlib.FunctionNameAndError(n.RepoDirectoryGroupsFindOneByIamCredentialID, err)
	}
	if err := array2DToObject.Convert(dataRows); err != nil {
		return nil, intlib.FunctionNameAndError(n.RepoDirectoryGroupsFindOneByIamCredentialID, err)
	}

	if len(array2DToObject.Objects()) == 0 {
		return nil, nil
	}

	if len(array2DToObject.Objects()) > 1 {
		n.logger.Log(ctx, slog.LevelError, fmt.Sprintf("length of array2DToObject.Objects(): %v", len(array2DToObject.Objects())), "function", intlib.FunctionName(n.RepoDirectoryGroupsFindOneByIamCredentialID))
		return nil, intlib.FunctionNameAndError(n.RepoDirectoryGroupsFindOneByIamCredentialID, fmt.Errorf("more than one %s found", intdoment.DirectoryGroupsRepository().RepositoryName))
	}

	directoryGroup := new(intdoment.DirectoryGroups)
	if jsonData, err := json.Marshal(array2DToObject.Objects()[0]); err != nil {
		return nil, intlib.FunctionNameAndError(n.RepoDirectoryGroupsFindOneByIamCredentialID, err)
	} else {
		n.logger.Log(ctx, slog.LevelDebug, "json parsing directoryGroup", "directoryGroup", string(jsonData), "function", intlib.FunctionName(n.RepoDirectoryGroupsFindOneByIamCredentialID))
		if err := json.Unmarshal(jsonData, directoryGroup); err != nil {
			return nil, intlib.FunctionNameAndError(n.RepoDirectoryGroupsFindOneByIamCredentialID, err)
		}
	}

	return directoryGroup, nil
}

func (n *PostrgresRepository) RepoDirectoryGroupsFindSystemGroupRuleAuthorizations(ctx context.Context) ([]intdoment.GroupRuleAuthorization, error) {
	systemGroup, err := n.RepoDirectoryGroupsFindSystemGroup(ctx, []string{intdoment.DirectoryGroupsRepository().ID})
	if err != nil {
		return nil, intlib.FunctionNameAndError(n.RepoDirectoryGroupsFindSystemGroupRuleAuthorizations, err)
	}

	groupRuleAuthorizationMModel, err := intlib.MetadataModelGetDatum(intdoment.GroupRuleAuthorizationsRepository().RepositoryName)
	if err != nil {
		return nil, intlib.FunctionNameAndError(n.RepoDirectoryGroupsFindSystemGroupRuleAuthorizations, err)
	}

	query := fmt.Sprintf(
		"SELECT %[1]s FROM %[2]s WHERE %[3]s = $1 AND %[4]s IS NULL AND (%[5]s = $2 OR %[5]s = $3 OR %[5]s = $4 OR %[5]s = $5 OR %[5]s = $6);",
		intdoment.GroupRuleAuthorizationsRepository().ID,                           //1
		intdoment.GroupRuleAuthorizationsRepository().RepositoryName,               //2
		intdoment.GroupRuleAuthorizationsRepository().DirectoryGroupsID,            //3
		intdoment.GroupRuleAuthorizationsRepository().DeactivatedOn,                //4
		intdoment.GroupRuleAuthorizationsRepository().GroupAuthorizationsRuleGroup, //5
	)
	n.logger.Log(ctx, slog.LevelDebug, query, "function", intlib.FunctionName(n.RepoDirectoryGroupsFindSystemGroupRuleAuthorizations))

	rows, err := n.db.Query(ctx, query, systemGroup.ID[0], intdoment.AUTH_RULE_GROUP_GROUP_RULE_AUTHORIZATION, intdoment.AUTH_RULE_GROUP_IAM_GROUP_AUTHORIZATION, intdoment.AUTH_RULE_GROUP_DIRECTORY, intdoment.AUTH_RULE_GROUP_IAM_CREDENTIALS, intdoment.AUTH_RULE_GROUP_DIRECTORY_GROUPS)
	if err != nil {
		return nil, intlib.FunctionNameAndError(n.RepoDirectoryGroupsFindSystemGroupRuleAuthorizations, fmt.Errorf("retrieve %s failed, err: %v", intdoment.IamCredentialsRepository().RepositoryName, err))
	}
	defer rows.Close()
	dataRows := make([]any, 0)
	for rows.Next() {
		if r, err := rows.Values(); err != nil {
			return nil, intlib.FunctionNameAndError(n.RepoDirectoryGroupsFindSystemGroupRuleAuthorizations, err)
		} else {
			dataRows = append(dataRows, r)
		}
	}

	array2DToObject, err := intlibmmodel.NewConvert2DArrayToObjects(groupRuleAuthorizationMModel, nil, false, false, []string{intdoment.GroupRuleAuthorizationsRepository().ID})
	if err != nil {
		return nil, intlib.FunctionNameAndError(n.RepoDirectoryGroupsFindSystemGroupRuleAuthorizations, err)
	}
	if err := array2DToObject.Convert(dataRows); err != nil {
		return nil, intlib.FunctionNameAndError(n.RepoDirectoryGroupsFindSystemGroupRuleAuthorizations, err)
	}

	groupRuleAuthorizations := make([]intdoment.GroupRuleAuthorization, 0)
	if jsonData, err := json.Marshal(array2DToObject.Objects()); err != nil {
		return nil, intlib.FunctionNameAndError(n.RepoDirectoryGroupsFindSystemGroupRuleAuthorizations, err)
	} else {
		n.logger.Log(ctx, slog.LevelDebug, "json parsing groupRuleAuthorizations", "groupRuleAuthorizations", string(jsonData), "function", intlib.FunctionName(n.RepoDirectoryGroupsFindSystemGroupRuleAuthorizations))
		if err := json.Unmarshal(jsonData, &groupRuleAuthorizations); err != nil {
			return nil, intlib.FunctionNameAndError(n.RepoDirectoryGroupsFindSystemGroupRuleAuthorizations, err)
		}
	}

	return groupRuleAuthorizations, nil
}

func (n *PostrgresRepository) RepoDirectoryGroupsCreateSystemGroup(ctx context.Context, columns []string) (*intdoment.DirectoryGroups, error) {
	directoryGroupsMModel, err := intlib.MetadataModelGetDatum(intdoment.DirectoryGroupsRepository().RepositoryName)
	if err != nil {
		return nil, intlib.FunctionNameAndError(n.RepoDirectoryGroupsFindSystemGroup, err)
	}

	if len(columns) == 0 {
		if dbColumnFields, err := intlibmmodel.DatabaseGetColumnFields(directoryGroupsMModel, intdoment.DirectoryGroupsRepository().RepositoryName, false, false); err != nil {
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
	n.logger.Log(ctx, slog.LevelDebug, query, "function", intlib.FunctionName(n.RepoDirectoryGroupsCreateSystemGroup))

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
	n.logger.Log(ctx, slog.LevelDebug, query, "function", intlib.FunctionName(n.RepoDirectoryGroupsCreateSystemGroup))

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
			intdoment.GroupRuleAuthorizationsRepository().RepositoryName,               //1
			intdoment.GroupRuleAuthorizationsRepository().DirectoryGroupsID,            //2
			intdoment.GroupRuleAuthorizationsRepository().GroupAuthorizationsRuleID,    //3
			intdoment.GroupRuleAuthorizationsRepository().GroupAuthorizationsRuleGroup, //4
		)
		n.logger.Log(ctx, slog.LevelDebug, query, "function", intlib.FunctionName(n.RepoDirectoryGroupsCreateSystemGroup))

		if rows := transaction.QueryRow(
			ctx,
			query,
			systemGroup.ID[0],
			gar.GroupAuthorizationRulesID[0].ID[0],
			gar.GroupAuthorizationRulesID[0].RuleGroup[0],
		); rows.Scan() == pgx.ErrNoRows {
			query = fmt.Sprintf(
				"INSERT INTO %[1]s (%[2]s, %[3]s, %[4]s) VALUES ($1, $2, $3);",
				intdoment.GroupRuleAuthorizationsRepository().RepositoryName,               //1
				intdoment.GroupRuleAuthorizationsRepository().DirectoryGroupsID,            //2
				intdoment.GroupRuleAuthorizationsRepository().GroupAuthorizationsRuleID,    //3
				intdoment.GroupRuleAuthorizationsRepository().GroupAuthorizationsRuleGroup, //4
			)
			n.logger.Log(ctx, slog.LevelDebug, query, "function", intlib.FunctionName(n.RepoDirectoryGroupsCreateSystemGroup))

			if _, err := transaction.Exec(ctx, query, systemGroup.ID[0], gar.GroupAuthorizationRulesID[0].ID[0], gar.GroupAuthorizationRulesID[0].RuleGroup[0]); err != nil {
				transaction.Rollback(ctx)
				return nil, intlib.FunctionNameAndError(n.RepoDirectoryGroupsCreateSystemGroup, fmt.Errorf("insert %s failed, err: %v", intdoment.GroupRuleAuthorizationsRepository().RepositoryName, err))
			}
		} else {
			transaction.Rollback(ctx)
			return nil, intlib.FunctionNameAndError(n.RepoDirectoryGroupsCreateSystemGroup, fmt.Errorf("get individual %s failed, err: %v", intdoment.GroupRuleAuthorizationsRepository().RepositoryName, rows.Scan()))
		}
	}

	if err := transaction.Commit(ctx); err != nil {
		return nil, intlib.FunctionNameAndError(n.RepoDirectoryGroupsCreateSystemGroup, fmt.Errorf("commit transaction to create system group failed, error: %v", err))
	}

	return systemGroup, nil
}

func (n *PostrgresRepository) RepoDirectoryGroupsFindSystemGroup(ctx context.Context, columns []string) (*intdoment.DirectoryGroups, error) {
	directoryGroupsMModel, err := intlib.MetadataModelGetDatum(intdoment.DirectoryGroupsRepository().RepositoryName)
	if err != nil {
		return nil, intlib.FunctionNameAndError(n.RepoDirectoryGroupsFindSystemGroup, err)
	}

	if len(columns) == 0 {
		if dbColumnFields, err := intlibmmodel.DatabaseGetColumnFields(directoryGroupsMModel, intdoment.DirectoryGroupsRepository().RepositoryName, false, false); err != nil {
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
	n.logger.Log(ctx, slog.LevelDebug, query, "function", intlib.FunctionName(n.RepoDirectoryGroupsFindSystemGroup))

	rows, err := n.db.Query(ctx, query)
	if err != nil {
		return nil, intlib.FunctionNameAndError(n.RepoDirectoryGroupsFindSystemGroup, fmt.Errorf("retrieve system %s failed, err: %v", intdoment.DirectoryGroupsRepository().RepositoryName, err))
	}
	defer rows.Close()
	dataRows := make([]any, 0)
	for rows.Next() {
		if r, err := rows.Values(); err != nil {
			return nil, intlib.FunctionNameAndError(n.RepoDirectoryGroupsFindSystemGroup, err)
		} else {
			dataRows = append(dataRows, r)
		}
	}

	array2DToObject, err := intlibmmodel.NewConvert2DArrayToObjects(directoryGroupsMModel, nil, false, false, columns)
	if err != nil {
		return nil, intlib.FunctionNameAndError(n.RepoDirectoryGroupsFindSystemGroup, err)
	}
	if err := array2DToObject.Convert(dataRows); err != nil {
		return nil, intlib.FunctionNameAndError(n.RepoDirectoryGroupsFindSystemGroup, err)
	}

	if len(array2DToObject.Objects()) == 0 {
		return nil, nil
	}

	if len(array2DToObject.Objects()) > 1 {
		n.logger.Log(ctx, slog.LevelError, fmt.Sprintf("length of array2DToObject.Objects(): %v", len(array2DToObject.Objects())))
		return nil, intlib.FunctionNameAndError(n.RepoDirectoryGroupsFindSystemGroup, fmt.Errorf("more than one system %s found", intdoment.DirectoryGroupsRepository().RepositoryName))
	}

	systemGroup := new(intdoment.DirectoryGroups)
	if jsonData, err := json.Marshal(array2DToObject.Objects()[0]); err != nil {
		return nil, intlib.FunctionNameAndError(n.RepoDirectoryGroupsFindSystemGroup, err)
	} else {
		n.logger.Log(ctx, slog.LevelDebug, "json parsing systemGroup", "systemGroup", string(jsonData), "function", intlib.FunctionName(n.RepoDirectoryGroupsFindSystemGroup))
		if err := json.Unmarshal(jsonData, systemGroup); err != nil {
			return nil, intlib.FunctionNameAndError(n.RepoDirectoryGroupsFindSystemGroup, err)
		}
	}

	return systemGroup, nil
}
