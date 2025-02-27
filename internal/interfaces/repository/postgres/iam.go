package postgres

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
	"strings"

	"github.com/gofrs/uuid/v5"
	intdoment "github.com/icipe-official/Data-Abstraction-Platform/internal/domain/entities"
	intlib "github.com/icipe-official/Data-Abstraction-Platform/internal/lib"
)

func (n *PostrgresRepository) RepoIamAuthorizationRulesGetAuthorized(ctx context.Context, iamAuthInfo *intdoment.IamAuthInfo, authContextDirectoryGroupID uuid.UUID, groupAuthorizationRules []*intdoment.IamGroupAuthorizationRule, currentIamAuthorizationRules *intdoment.IamAuthorizationRules) ([]*intdoment.IamAuthorizationRule, error) {
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
	n.logger.Log(ctx, slog.LevelDebug, query, "function", intlib.FunctionName(n.RepoIamAuthorizationRulesGetAuthorized))
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
