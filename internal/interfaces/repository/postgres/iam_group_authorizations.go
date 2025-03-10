package postgres

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
	"net/http"
	"strings"

	"github.com/gofrs/uuid/v5"
	intdoment "github.com/icipe-official/Data-Abstraction-Platform/internal/domain/entities"
	intlib "github.com/icipe-official/Data-Abstraction-Platform/internal/lib"
	intlibmmodel "github.com/icipe-official/Data-Abstraction-Platform/internal/lib/metadata_model"
)

func (n *PostgresSelectQuery) IamGroupAuthorizationsGetSelectQuery(ctx context.Context, metadataModel map[string]any, metadataModelParentPath string) (*SelectQuery, error) {
	if iamAuthorizationRule, err := n.repo.RepoIamGroupAuthorizationsGetAuthorized(
		ctx,
		n.iamCredential,
		n.authContextDirectoryGroupID,
		[]*intdoment.IamGroupAuthorizationRule{
			{
				ID:        intdoment.AUTH_RULE_RETRIEVE_SELF,
				RuleGroup: intdoment.AUTH_RULE_GROUP_IAM_GROUP_AUTHORIZATION,
			},
			{
				ID:        intdoment.AUTH_RULE_RETRIEVE,
				RuleGroup: intdoment.AUTH_RULE_GROUP_IAM_GROUP_AUTHORIZATION,
			},
			{
				ID:        intdoment.AUTH_RULE_RETRIEVE_OTHERS,
				RuleGroup: intdoment.AUTH_RULE_GROUP_IAM_GROUP_AUTHORIZATION,
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

	selectQuery := SelectQuery{
		TableName: intdoment.IamGroupAuthorizationsRepository().RepositoryName,
		Query:     "",
		Where:     make(map[string]map[int][][]string),
		Join:      make(map[string]*SelectQuery),
		JoinQuery: make([]string, 0),
	}

	if tableUid, ok := metadataModel[intlibmmodel.FIELD_GROUP_PROP_DATABASE_TABLE_COLLECTION_UID].(string); ok && len(tableUid) > 0 {
		selectQuery.TableUid = tableUid
	} else {
		return nil, intlib.FunctionNameAndError(n.DirectoryGroupsGetSelectQuery, errors.New("tableUid is empty"))
	}

	if value, err := intlibmmodel.DatabaseGetColumnFields(metadataModel, selectQuery.TableUid, false, false); err != nil {
		return nil, intlib.FunctionNameAndError(n.DirectoryGroupsGetSelectQuery, fmt.Errorf("extract database column fields failed, error: %v", err))
	} else {
		selectQuery.Columns = value
	}

	if fgKeyString, ok := selectQuery.Columns.Fields[intdoment.IamGroupAuthorizationsRepository().ID][intlibmmodel.FIELD_GROUP_PROP_FIELD_GROUP_KEY].(string); ok {
		if value := n.getWhereCondition(quoteColumns, selectQuery.TableUid, "", intdoment.IamGroupAuthorizationsRepository().ID, fgKeyString, PROCESS_QUERY_CONDITION_AS_SINGLE_VALUE, ""); len(value) > 0 {
			selectQuery.Where[intdoment.IamGroupAuthorizationsRepository().ID] = value
		}
	}

	if fgKeyString, ok := selectQuery.Columns.Fields[intdoment.IamGroupAuthorizationsRepository().IamCredentialsID][intlibmmodel.FIELD_GROUP_PROP_FIELD_GROUP_KEY].(string); ok {
		if value := n.getWhereCondition(quoteColumns, selectQuery.TableUid, "", intdoment.IamGroupAuthorizationsRepository().ID, fgKeyString, PROCESS_QUERY_CONDITION_AS_SINGLE_VALUE, ""); len(value) > 0 {
			selectQuery.Where[intdoment.IamGroupAuthorizationsRepository().IamCredentialsID] = value
		}
	}

	if fgKeyString, ok := selectQuery.Columns.Fields[intdoment.IamGroupAuthorizationsRepository().GroupRuleAuthorizationsID][intlibmmodel.FIELD_GROUP_PROP_FIELD_GROUP_KEY].(string); ok {
		if value := n.getWhereCondition(quoteColumns, selectQuery.TableUid, "", intdoment.IamGroupAuthorizationsRepository().ID, fgKeyString, PROCESS_QUERY_CONDITION_AS_SINGLE_VALUE, ""); len(value) > 0 {
			selectQuery.Where[intdoment.IamGroupAuthorizationsRepository().GroupRuleAuthorizationsID] = value
		}
	}

	if fgKeyString, ok := selectQuery.Columns.Fields[intdoment.IamGroupAuthorizationsRepository().CreatedOn][intlibmmodel.FIELD_GROUP_PROP_FIELD_GROUP_KEY].(string); ok {
		if value := n.getWhereCondition(quoteColumns, selectQuery.TableUid, "", intdoment.IamGroupAuthorizationsRepository().ID, fgKeyString, PROCESS_QUERY_CONDITION_AS_SINGLE_VALUE, ""); len(value) > 0 {
			selectQuery.Where[intdoment.IamGroupAuthorizationsRepository().CreatedOn] = value
		}
	}

	if fgKeyString, ok := selectQuery.Columns.Fields[intdoment.IamGroupAuthorizationsRepository().DeactivatedOn][intlibmmodel.FIELD_GROUP_PROP_FIELD_GROUP_KEY].(string); ok {
		if value := n.getWhereCondition(quoteColumns, selectQuery.TableUid, "", intdoment.IamGroupAuthorizationsRepository().ID, fgKeyString, PROCESS_QUERY_CONDITION_AS_SINGLE_VALUE, ""); len(value) > 0 {
			selectQuery.Where[intdoment.IamGroupAuthorizationsRepository().DeactivatedOn] = value
		}
	}

	//iam credentials

	//group rule authorizations

	selectQuery.appendSort()
	selectQuery.appendLimitOffset(metadataModel)

	return &selectQuery, nil
}

func (n *PostrgresRepository) RepoIamGroupAuthorizationsGetAuthorized(ctx context.Context, iamAuthInfo *intdoment.IamCredentials, authContextDirectoryGroupID uuid.UUID, groupAuthorizationRules []*intdoment.IamGroupAuthorizationRule, currentIamAuthorizationRules *intdoment.IamAuthorizationRules) ([]*intdoment.IamAuthorizationRule, error) {
	if iamAuthInfo == nil {
		return nil, nil
	}

	selectColumns := []string{
		fmt.Sprintf("%s.%s", intdoment.IamGroupAuthorizationsRepository().RepositoryName, intdoment.IamGroupAuthorizationsRepository().ID),                             //1
		fmt.Sprintf("%s.%s", intdoment.GroupRuleAuthorizationsRepository().RepositoryName, intdoment.GroupRuleAuthorizationsRepository().DirectoryGroupsID),            //2
		fmt.Sprintf("%s.%s", intdoment.GroupRuleAuthorizationsRepository().RepositoryName, intdoment.GroupRuleAuthorizationsRepository().GroupAuthorizationsRuleID),    //3
		fmt.Sprintf("%s.%s", intdoment.GroupRuleAuthorizationsRepository().RepositoryName, intdoment.GroupRuleAuthorizationsRepository().GroupAuthorizationsRuleGroup), //4
	}

	nextPlaceholder := 1
	whereOrConditions := make([]string, 0)
	valuesForCondition := make([]any, 0)
	cacheIamAuthRules := make([]*intdoment.IamAuthorizationRule, 0)
	for _, gar := range groupAuthorizationRules {
		if currentIamAuthorizationRules != nil {
			if iamGroupAuthorizationID, ok := (*currentIamAuthorizationRules)[genIamGroupAuthorizationIDsKey(
				authContextDirectoryGroupID,
				gar.ID,
				gar.RuleGroup,
			)]; ok {
				cacheIamAuthRules = append(cacheIamAuthRules, iamGroupAuthorizationID)
				continue
			}
		}
		whereAndCondition := make([]string, 0)
		whereAndCondition = append(whereAndCondition, fmt.Sprintf("%s.%s = $%d", intdoment.GroupRuleAuthorizationsRepository().RepositoryName, intdoment.GroupRuleAuthorizationsRepository().DirectoryGroupsID, nextPlaceholder))
		valuesForCondition = append(valuesForCondition, authContextDirectoryGroupID)
		nextPlaceholder += 1
		if gar.ID != "*" && len(gar.ID) > 0 {
			whereAndCondition = append(whereAndCondition, fmt.Sprintf("%s.%s = $%d", intdoment.GroupRuleAuthorizationsRepository().RepositoryName, intdoment.GroupRuleAuthorizationsRepository().GroupAuthorizationsRuleID, nextPlaceholder))
			valuesForCondition = append(valuesForCondition, gar.ID)
			nextPlaceholder += 1
		}
		whereAndCondition = append(whereAndCondition, fmt.Sprintf("%s.%s = $%d", intdoment.GroupRuleAuthorizationsRepository().RepositoryName, intdoment.GroupRuleAuthorizationsRepository().GroupAuthorizationsRuleGroup, nextPlaceholder))
		valuesForCondition = append(valuesForCondition, gar.RuleGroup)
		nextPlaceholder += 1
		whereOrConditions = append(whereOrConditions, strings.Join(whereAndCondition, " AND "))
	}

	if len(cacheIamAuthRules) > 0 {
		return cacheIamAuthRules, nil
	}

	if len(whereOrConditions) == 0 || len(valuesForCondition) == 0 {
		return nil, errors.New("groupAuthorizationRules invalid")
	}

	query := fmt.Sprintf(
		"SELECT %[1]s FROM %[2]s INNER JOIN %[3]s ON %[2]s.%[4]s = %[3]s.%[5]s WHERE %[6]s AND %[2]s.%[7]s IS NULL AND %[3]s.%[8]s IS NULL AND %[2]s.%[9]s = %[10]s;",
		strings.Join(selectColumns, " , "),                                     //1
		intdoment.IamGroupAuthorizationsRepository().RepositoryName,            //2
		intdoment.GroupRuleAuthorizationsRepository().RepositoryName,           //3
		intdoment.IamGroupAuthorizationsRepository().GroupRuleAuthorizationsID, //4
		intdoment.GroupRuleAuthorizationsRepository().ID,                       //5
		strings.Join(whereOrConditions, " OR "),                                //6
		intdoment.IamGroupAuthorizationsRepository().DeactivatedOn,             //7
		intdoment.GroupRuleAuthorizationsRepository().DeactivatedOn,            //8
		intdoment.IamGroupAuthorizationsRepository().IamCredentialsID,          //9
		GetandUpdateNextPlaceholder(&nextPlaceholder),                          //10
	)
	n.logger.Log(ctx, slog.LevelDebug, query, "function", intlib.FunctionName(n.RepoIamGroupAuthorizationsGetAuthorized))
	valuesForCondition = append(valuesForCondition, iamAuthInfo.ID[0])

	rows, err := n.db.Query(ctx, query, valuesForCondition...)
	if err != nil {
		errmsg := fmt.Errorf("get %s failed, error: %v", intdoment.IamGroupAuthorizationsRepository().RepositoryName, err)
		n.logger.Log(ctx, slog.LevelDebug, errmsg.Error())
		return nil, errmsg
	}
	newIamAuthorizationRules := make([]*intdoment.IamAuthorizationRule, 0)
	for rows.Next() {
		newIamAuthorizationRule := new(intdoment.IamAuthorizationRule)
		if err := rows.Scan(&newIamAuthorizationRule.ID, &newIamAuthorizationRule.DirectoryGroupID, &newIamAuthorizationRule.GroupAuthorizationRuleID, &newIamAuthorizationRule.GroupAuthorizationRuleGroup); err != nil {
			errmsg := fmt.Errorf("read %s row failed, error: %v", intdoment.IamGroupAuthorizationsRepository().RepositoryName, err)
			n.logger.Log(ctx, slog.LevelDebug, errmsg.Error())
			return nil, errmsg
		}
		newIamAuthorizationRules = append(newIamAuthorizationRules, newIamAuthorizationRule)
		if currentIamAuthorizationRules != nil {
			(*currentIamAuthorizationRules)[genIamGroupAuthorizationIDsKey(
				newIamAuthorizationRule.DirectoryGroupID,
				newIamAuthorizationRule.GroupAuthorizationRuleGroup,
				newIamAuthorizationRule.GroupAuthorizationRuleGroup,
			)] = newIamAuthorizationRule
		}
	}

	if len(newIamAuthorizationRules) > 0 {
		return newIamAuthorizationRules, nil
	} else {
		return nil, nil
	}
}

func genIamGroupAuthorizationIDsKey(groupRuleAuthorizationID uuid.UUID, groupRuleAuthorizationRuleID string, groupRuleAuthorizationRuleGroup string) string {
	return fmt.Sprintf("%s/%s/%s",
		groupRuleAuthorizationID,
		groupRuleAuthorizationRuleID,
		groupRuleAuthorizationRuleGroup,
	)
}

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
