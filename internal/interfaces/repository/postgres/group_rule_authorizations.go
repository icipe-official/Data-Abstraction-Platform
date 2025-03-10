package postgres

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
	"net/http"
	"strings"

	"github.com/brunoga/deep"
	"github.com/gofrs/uuid/v5"
	intdoment "github.com/icipe-official/Data-Abstraction-Platform/internal/domain/entities"
	intdomint "github.com/icipe-official/Data-Abstraction-Platform/internal/domain/interfaces"
	intlib "github.com/icipe-official/Data-Abstraction-Platform/internal/lib"
	intlibmmodel "github.com/icipe-official/Data-Abstraction-Platform/internal/lib/metadata_model"
)

func (n *PostrgresRepository) RepoGroupRuleAuthorizationsSearch(
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
	selectQuery, err := pSelectQuery.GroupRuleAuthorizationsGetSelectQuery(ctx, mmsearch.MetadataModel, "")
	if err != nil {
		return nil, intlib.FunctionNameAndError(n.RepoGroupRuleAuthorizationsSearch, err)
	}

	query, selectQueryExtract := GetSelectQuery(selectQuery, whereAfterJoin)
	n.logger.Log(ctx, slog.LevelDebug, query, "function", intlib.FunctionName(n.RepoGroupRuleAuthorizationsSearch))

	rows, err := n.db.Query(ctx, query)
	if err != nil {
		return nil, intlib.FunctionNameAndError(n.RepoGroupRuleAuthorizationsSearch, fmt.Errorf("retrieve %s failed, err: %v", intdoment.GroupRuleAuthorizationsRepository().RepositoryName, err))
	}
	defer rows.Close()
	dataRows := make([]any, 0)
	for rows.Next() {
		if r, err := rows.Values(); err != nil {
			return nil, intlib.FunctionNameAndError(n.RepoGroupRuleAuthorizationsSearch, err)
		} else {
			dataRows = append(dataRows, r)
		}
	}

	array2DToObject, err := intlibmmodel.NewConvert2DArrayToObjects(mmsearch.MetadataModel, selectQueryExtract.Fields, false, false, nil)
	if err != nil {
		return nil, intlib.FunctionNameAndError(n.RepoGroupRuleAuthorizationsSearch, err)
	}
	if err := array2DToObject.Convert(dataRows); err != nil {
		return nil, intlib.FunctionNameAndError(n.RepoGroupRuleAuthorizationsSearch, err)
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

func (n *PostgresSelectQuery) GroupRuleAuthorizationsGetSelectQuery(ctx context.Context, metadataModel map[string]any, metadataModelParentPath string) (*SelectQuery, error) {
	if iamAuthorizationRule, err := n.repo.RepoIamGroupAuthorizationsGetAuthorized(
		ctx,
		n.iamCredential,
		n.authContextDirectoryGroupID,
		[]*intdoment.IamGroupAuthorizationRule{
			{
				ID:        intdoment.AUTH_RULE_RETRIEVE,
				RuleGroup: intdoment.AUTH_RULE_GROUP_GROUP_RULE_AUTHORIZATIONS,
			},
			{
				ID:        intdoment.AUTH_RULE_RETRIEVE_OTHERS,
				RuleGroup: intdoment.AUTH_RULE_GROUP_GROUP_RULE_AUTHORIZATIONS,
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
		TableName: intdoment.GroupRuleAuthorizationsRepository().RepositoryName,
		Query:     "",
		Where:     make(map[string]map[int][][]string),
		Join:      make(map[string]*SelectQuery),
		JoinQuery: make([]string, 0),
	}

	if tableUid, ok := metadataModel[intlibmmodel.FIELD_GROUP_PROP_DATABASE_TABLE_COLLECTION_UID].(string); ok && len(tableUid) > 0 {
		selectQuery.TableUid = tableUid
	} else {
		return nil, intlib.FunctionNameAndError(n.GroupRuleAuthorizationsGetSelectQuery, errors.New("tableUid is empty"))
	}

	if value, err := intlibmmodel.DatabaseGetColumnFields(metadataModel, selectQuery.TableUid, false, false); err != nil {
		return nil, intlib.FunctionNameAndError(n.GroupRuleAuthorizationsGetSelectQuery, fmt.Errorf("extract database column fields failed, error: %v", err))
	} else {
		selectQuery.Columns = value
	}

	if !n.startSearchDirectoryGroupID.IsNil() {
		cteName := fmt.Sprintf("%s_%s", selectQuery.TableUid, RECURSIVE_DIRECTORY_GROUPS_DEFAULT_CTE_NAME)
		cteWhere := make([]string, 0)

		if iamAuthorizationRule, err := n.repo.RepoIamGroupAuthorizationsGetAuthorized(
			ctx,
			n.iamCredential,
			n.authContextDirectoryGroupID,
			[]*intdoment.IamGroupAuthorizationRule{
				{
					ID:        intdoment.AUTH_RULE_RETRIEVE_OTHERS,
					RuleGroup: intdoment.AUTH_RULE_GROUP_GROUP_RULE_AUTHORIZATIONS,
				},
			},
			n.iamAuthorizationRules,
		); err == nil && iamAuthorizationRule != nil {
			selectQuery.DirectoryGroupsSubGroupsCTEName = cteName
			selectQuery.DirectoryGroupsSubGroupsCTE = RecursiveDirectoryGroupsSubGroupsCte(n.startSearchDirectoryGroupID, cteName)
			cteWhere = append(cteWhere, fmt.Sprintf("(%s) IN (SELECT %s FROM %s)", intdoment.GroupRuleAuthorizationsRepository().DirectoryGroupsID, intdoment.DirectoryGroupsSubGroupsRepository().SubGroupID, cteName))
		}

		if iamAuthorizationRule, err := n.repo.RepoIamGroupAuthorizationsGetAuthorized(
			ctx,
			n.iamCredential,
			n.authContextDirectoryGroupID,
			[]*intdoment.IamGroupAuthorizationRule{
				{
					ID:        intdoment.AUTH_RULE_RETRIEVE,
					RuleGroup: intdoment.AUTH_RULE_GROUP_GROUP_RULE_AUTHORIZATIONS,
				},
			},
			n.iamAuthorizationRules,
		); err == nil && iamAuthorizationRule != nil {
			if len(selectQuery.DirectoryGroupsSubGroupsCTEName) == 0 {
				selectQuery.DirectoryGroupsSubGroupsCTEName = cteName
			}
			if len(selectQuery.DirectoryGroupsSubGroupsCTE) == 0 {
				selectQuery.DirectoryGroupsSubGroupsCTE = RecursiveDirectoryGroupsSubGroupsCte(n.startSearchDirectoryGroupID, cteName)
			}
			cteWhere = append(cteWhere, fmt.Sprintf("%s = '%s'", intdoment.GroupRuleAuthorizationsRepository().DirectoryGroupsID, n.startSearchDirectoryGroupID.String()))
		}

		if len(cteWhere) > 0 {
			if len(cteWhere) > 1 {
				selectQuery.DirectoryGroupsSubGroupsCTECondition = fmt.Sprintf("(%s)", strings.Join(cteWhere, " OR "))
			} else {
				selectQuery.DirectoryGroupsSubGroupsCTECondition = cteWhere[0]
			}
		}

		n.startSearchDirectoryGroupID = uuid.Nil
	}

	if _, ok := selectQuery.Columns.Fields[intdoment.GroupRuleAuthorizationsRepository().ID][intlibmmodel.FIELD_GROUP_PROP_FIELD_GROUP_KEY].(string); ok {
		if value := n.getWhereCondition(quoteColumns, selectQuery.TableUid, "", intdoment.GroupRuleAuthorizationsRepository().ID, "", PROCESS_QUERY_CONDITION_AS_SINGLE_VALUE, ""); len(value) > 0 {
			selectQuery.Where[intdoment.GroupRuleAuthorizationsRepository().ID] = value
		}
	}
	if _, ok := selectQuery.Columns.Fields[intdoment.GroupRuleAuthorizationsRepository().DirectoryGroupsID][intlibmmodel.FIELD_GROUP_PROP_FIELD_GROUP_KEY].(string); ok {
		if value := n.getWhereCondition(quoteColumns, selectQuery.TableUid, "", intdoment.GroupRuleAuthorizationsRepository().DirectoryGroupsID, "", PROCESS_QUERY_CONDITION_AS_SINGLE_VALUE, ""); len(value) > 0 {
			selectQuery.Where[intdoment.GroupRuleAuthorizationsRepository().DirectoryGroupsID] = value
		}
	}
	if _, ok := selectQuery.Columns.Fields[intdoment.GroupRuleAuthorizationsRepository().GroupAuthorizationsRuleID][intlibmmodel.FIELD_GROUP_PROP_FIELD_GROUP_KEY].(string); ok {
		if value := n.getWhereCondition(quoteColumns, selectQuery.TableUid, "", intdoment.GroupRuleAuthorizationsRepository().GroupAuthorizationsRuleID, "", PROCESS_QUERY_CONDITION_AS_SINGLE_VALUE, ""); len(value) > 0 {
			selectQuery.Where[intdoment.GroupRuleAuthorizationsRepository().GroupAuthorizationsRuleID] = value
		}
	}
	if _, ok := selectQuery.Columns.Fields[intdoment.GroupRuleAuthorizationsRepository().GroupAuthorizationsRuleGroup][intlibmmodel.FIELD_GROUP_PROP_FIELD_GROUP_KEY].(string); ok {
		if value := n.getWhereCondition(quoteColumns, selectQuery.TableUid, "", intdoment.GroupRuleAuthorizationsRepository().GroupAuthorizationsRuleGroup, "", PROCESS_QUERY_CONDITION_AS_SINGLE_VALUE, ""); len(value) > 0 {
			selectQuery.Where[intdoment.GroupRuleAuthorizationsRepository().GroupAuthorizationsRuleGroup] = value
		}
	}
	if _, ok := selectQuery.Columns.Fields[intdoment.GroupRuleAuthorizationsRepository().CreatedOn][intlibmmodel.FIELD_GROUP_PROP_FIELD_GROUP_KEY].(string); ok {
		if value := n.getWhereCondition(quoteColumns, selectQuery.TableUid, "", intdoment.GroupRuleAuthorizationsRepository().CreatedOn, "", PROCESS_QUERY_CONDITION_AS_SINGLE_VALUE, ""); len(value) > 0 {
			selectQuery.Where[intdoment.GroupRuleAuthorizationsRepository().CreatedOn] = value
		}
	}
	if _, ok := selectQuery.Columns.Fields[intdoment.GroupRuleAuthorizationsRepository().DeactivatedOn][intlibmmodel.FIELD_GROUP_PROP_FIELD_GROUP_KEY].(string); ok {
		if value := n.getWhereCondition(quoteColumns, selectQuery.TableUid, "", intdoment.GroupRuleAuthorizationsRepository().DeactivatedOn, "", PROCESS_QUERY_CONDITION_AS_SINGLE_VALUE, ""); len(value) > 0 {
			selectQuery.Where[intdoment.GroupRuleAuthorizationsRepository().DeactivatedOn] = value
		}
	}

	directoryGroupsIDJoinDirectoryGroups := intlib.MetadataModelGenJoinKey(intdoment.GroupRuleAuthorizationsRepository().DirectoryGroupsID, intdoment.DirectoryGroupsRepository().RepositoryName)
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
				GetJoinColumnName(sq.TableUid, intdoment.DirectoryGroupsRepository().ID, true),                                  //1
				GetJoinColumnName(selectQuery.TableUid, intdoment.GroupRuleAuthorizationsRepository().DirectoryGroupsID, false), //2
			)

			selectQuery.Join[directoryGroupsIDJoinDirectoryGroups] = sq
		}
	}

	groupRuleAuthorizationsJoinGroupAuthorizationRules := intlib.MetadataModelGenJoinKey(intdoment.GroupRuleAuthorizationsRepository().RepositoryName, intdoment.GroupAuthorizationRulesRepository().RepositoryName)
	if value, err := n.extractChildMetadataModel(metadataModel, groupRuleAuthorizationsJoinGroupAuthorizationRules); err != nil {
		n.logger.Log(ctx, slog.LevelDebug, fmt.Sprintf("extract %s child metadata model failed, error: %v", groupRuleAuthorizationsJoinGroupAuthorizationRules, err))
	} else {
		if sq, err := n.GroupAuthorizationRulesGetSelectQuery(
			ctx,
			value,
			metadataModelParentPath,
		); err != nil {
			n.logger.Log(ctx, slog.LevelDebug, fmt.Sprintf("get child %s psql query failed, error: %v", groupRuleAuthorizationsJoinGroupAuthorizationRules, err))
		} else {
			sq.JoinType = JOIN_INNER
			sq.JoinQuery = make([]string, 1)
			sq.JoinQuery[0] = fmt.Sprintf(
				"%[1]s = %[2]s AND %[3]s = %[4]s",
				GetJoinColumnName(sq.TableUid, intdoment.GroupAuthorizationRulesRepository().ID, true),                                     //1
				GetJoinColumnName(selectQuery.TableUid, intdoment.GroupRuleAuthorizationsRepository().GroupAuthorizationsRuleID, false),    //2
				GetJoinColumnName(sq.TableUid, intdoment.GroupAuthorizationRulesRepository().RuleGroup, true),                              //3
				GetJoinColumnName(selectQuery.TableUid, intdoment.GroupRuleAuthorizationsRepository().GroupAuthorizationsRuleGroup, false), //4
			)

			selectQuery.Join[groupRuleAuthorizationsJoinGroupAuthorizationRules] = sq
		}
	}

	groupRuleAuthorizationsJoinGroupRuleAuthorizationIDs := intlib.MetadataModelGenJoinKey(intdoment.GroupRuleAuthorizationsRepository().RepositoryName, intdoment.GroupRuleAuthorizationsIDsRepository().RepositoryName)
	if value, err := n.extractChildMetadataModel(metadataModel, groupRuleAuthorizationsJoinGroupRuleAuthorizationIDs); err != nil {
		n.logger.Log(ctx, slog.LevelDebug, fmt.Sprintf("extract %s child metadata model failed, error: %v", groupRuleAuthorizationsJoinGroupRuleAuthorizationIDs, err))
	} else {
		if sq, err := n.AuthorizationIDsGetSelectQuery(
			ctx,
			value,
			metadataModelParentPath,
			intdoment.GroupRuleAuthorizationsIDsRepository().RepositoryName,
			[]AuthIDsSelectQueryPKey{{Name: intdoment.GroupRuleAuthorizationsIDsRepository().ID, ProcessAs: PROCESS_QUERY_CONDITION_AS_SINGLE_VALUE}},
			intdoment.GroupRuleAuthorizationsIDsRepository().CreationIamGroupAuthorizationsID,
			intdoment.GroupRuleAuthorizationsIDsRepository().DeactivationIamGroupAuthorizationsID,
		); err != nil {
			n.logger.Log(ctx, slog.LevelDebug, fmt.Sprintf("get child %s psql query failed, error: %v", groupRuleAuthorizationsJoinGroupRuleAuthorizationIDs, err))
		} else {
			if len(sq.Where) == 0 {
				sq.JoinType = JOIN_LEFT
			} else {
				sq.JoinType = JOIN_INNER
			}
			sq.JoinQuery = make([]string, 1)
			sq.JoinQuery[0] = fmt.Sprintf(
				"%[1]s = %[2]s",
				GetJoinColumnName(sq.TableUid, intdoment.GroupRuleAuthorizationsIDsRepository().ID, true),        //1
				GetJoinColumnName(selectQuery.TableUid, intdoment.GroupRuleAuthorizationsRepository().ID, false), //2
			)

			selectQuery.Join[groupRuleAuthorizationsJoinGroupRuleAuthorizationIDs] = sq
		}
	}

	selectQuery.appendSort()
	selectQuery.appendLimitOffset(metadataModel)

	return &selectQuery, nil
}
