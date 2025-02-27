package postgres

import (
	"context"
	"encoding/json"
	"fmt"
	"log/slog"
	"slices"
	"strings"

	intdoment "github.com/icipe-official/Data-Abstraction-Platform/internal/domain/entities"
	intlib "github.com/icipe-official/Data-Abstraction-Platform/internal/lib"
	intlibmmodel "github.com/icipe-official/Data-Abstraction-Platform/internal/lib/metadata_model"
)

func (n *PostrgresRepository) RepoIamGroupAuthorizationsSystemRolesInsertMany(ctx context.Context, iamCredenial *intdoment.IamCredentials, groupRuleAuthorizations []intdoment.GroupRuleAuthorization) (int, error) {
	query := fmt.Sprintf(
		"INSERT INTO %[1]s (%[2]s, %[3]s) VALUES ($1, $2);",
		intdoment.IamGroupAuthorizationsRepository().RepositoryName,            //1
		intdoment.IamGroupAuthorizationsRepository().IamCredentialsID,          //2
		intdoment.IamGroupAuthorizationsRepository().GroupRuleAuthorizationsID, //3
	)
	n.logger.Log(ctx, slog.LevelDebug, query, "function", intlib.FunctionName(n.RepoIamGroupAuthorizationsSystemRolesInsertMany))

	successfulInserts := 0
	for _, gra := range groupRuleAuthorizations {
		if _, err := n.db.Exec(ctx, query, iamCredenial.ID[0], gra.ID[0]); err != nil {
			return successfulInserts, intlib.FunctionNameAndError(n.RepoIamGroupAuthorizationsSystemRolesInsertMany, fmt.Errorf("insert %v failed, error: %v", intdoment.IamGroupAuthorizationsRepository().RepositoryName, err))
		}
		successfulInserts += 1
	}

	return successfulInserts, nil
}

func (n *PostrgresRepository) RepoDirectoryGroupsFindSystemGroupRuleAuthorizations(ctx context.Context) ([]intdoment.GroupRuleAuthorization, error) {
	systemGroup, err := n.RepoDirectoryGroupsFindSystemGroup(ctx, []string{intdoment.DirectoryGroupsRepository().ID})
	if err != nil {
		return nil, intlib.FunctionNameAndError(n.RepoDirectoryGroupsFindSystemGroupRuleAuthorizations, err)
	}

	groupRuleAuthorizationMModel, err := intlib.MetadataModelGetDatum(intdoment.GroupRuleAuthorizationsRepository().RepositoryName)
	if err != nil {
		return nil, intlib.FunctionNameAndError(n.RepoIamCredentialsFindOneByID, err)
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
		return nil, intlib.FunctionNameAndError(n.RepoIamCredentialsFindOneByID, fmt.Errorf("retrieve %s failed, err: %v", intdoment.IamCredentialsRepository().RepositoryName, err))
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

func (n *PostrgresRepository) RepoIamCredentialsFindOneByID(ctx context.Context, column string, value any, columns []string) (*intdoment.IamCredentials, error) {
	iamCredentialsMModel, err := intlib.MetadataModelGetDatum(intdoment.IamCredentialsRepository().RepositoryName)
	if err != nil {
		return nil, intlib.FunctionNameAndError(n.RepoIamCredentialsFindOneByID, err)
	}

	if len(columns) == 0 {
		if dbColumnFields, err := intlibmmodel.DatabaseGetColumnFields(iamCredentialsMModel, intdoment.IamCredentialsRepository().RepositoryName, intdoment.IamCredentialsRepository().RepositoryName, false, false); err != nil {
			return nil, intlib.FunctionNameAndError(n.RepoIamCredentialsFindOneByID, err)
		} else {
			columns = dbColumnFields.ColumnFieldsReadOrder
		}
	}

	if !slices.Contains(columns, intdoment.IamCredentialsRepository().ID) {
		columns = append(columns, intdoment.IamCredentialsRepository().ID)
	}

	query := fmt.Sprintf(
		"SELECT %[1]s FROM %[2]s WHERE %[3]s = $1;",
		strings.Join(columns, ","),                          //1
		intdoment.IamCredentialsRepository().RepositoryName, //2
		column, //3
	)
	n.logger.Log(ctx, slog.LevelDebug, query, "function", intlib.FunctionName(n.RepoIamCredentialsFindOneByID))

	rows, err := n.db.Query(ctx, query, value)
	if err != nil {
		return nil, intlib.FunctionNameAndError(n.RepoIamCredentialsFindOneByID, fmt.Errorf("retrieve %s failed, err: %v", intdoment.IamCredentialsRepository().RepositoryName, err))
	}
	defer rows.Close()
	dataRows := make([]any, 0)
	for rows.Next() {
		if r, err := rows.Values(); err != nil {
			return nil, intlib.FunctionNameAndError(n.RepoIamCredentialsFindOneByID, err)
		} else {
			dataRows = append(dataRows, r)
		}
	}

	array2DToObject, err := intlibmmodel.NewConvert2DArrayToObjects(iamCredentialsMModel, nil, false, false, columns)
	if err != nil {
		return nil, intlib.FunctionNameAndError(n.RepoIamCredentialsFindOneByID, err)
	}
	if err := array2DToObject.Convert(dataRows); err != nil {
		return nil, intlib.FunctionNameAndError(n.RepoIamCredentialsFindOneByID, err)
	}

	if len(array2DToObject.Objects()) == 0 {
		return nil, nil
	}

	if len(array2DToObject.Objects()) > 1 {
		n.logger.Log(ctx, slog.LevelError, fmt.Sprintf("length of array2DToObject.Objects(): %v", len(array2DToObject.Objects())), "function", intlib.FunctionName(n.RepoIamCredentialsFindOneByID))
		return nil, intlib.FunctionNameAndError(n.RepoIamCredentialsFindOneByID, fmt.Errorf("more than one %s found", intdoment.IamCredentialsRepository().RepositoryName))
	}

	iamCredential := new(intdoment.IamCredentials)
	if jsonData, err := json.Marshal(array2DToObject.Objects()[0]); err != nil {
		return nil, intlib.FunctionNameAndError(n.RepoIamCredentialsFindOneByID, err)
	} else {
		n.logger.Log(ctx, slog.LevelDebug, "json parsing iamCredential", "iamCredential", string(jsonData), "function", intlib.FunctionName(n.RepoIamCredentialsFindOneByID))
		if err := json.Unmarshal(jsonData, iamCredential); err != nil {
			return nil, intlib.FunctionNameAndError(n.RepoIamCredentialsFindOneByID, err)
		}
	}

	return iamCredential, nil
}
