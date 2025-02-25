package entities

import (
	"time"

	"github.com/gofrs/uuid/v5"
)

type GroupRuleAuthorization struct {
	ID                       []uuid.UUID `json:"id,omitempty"`
	DirectoryGroupsID        []uuid.UUID `json:"directory_groups_id,omitempty"`
	GroupAuthorizationRuleID []struct {
		GroupAuthorizationRulesID    []string `json:"group_authorization_rules_id,omitempty"`
		GroupAuthorizationRulesGroup []string `json:"group_authorization_rules_group,omitempty"`
	} `json:"group_authorization_rules_id,omitempty"`
	CreatedOn     []time.Time `json:"created_on,omitempty"`
	DeactivatedOn []time.Time `json:"deactivated_on,omitempty"`
}

type groupRuleAuthorizationRepository struct {
	RepositoryName string

	ID                           string
	DirectoryGroupsID            string
	GroupCreatedOn               string
	GroupAuthorizationsRuleID    string
	GroupAuthorizationsRuleGroup string
	CreatedOn                    string
	DeactivatedOn                string
}

func GroupRuleAuthorizationRepository() groupRuleAuthorizationRepository {
	return groupRuleAuthorizationRepository{
		RepositoryName: "group_rule_authorizations",

		ID:                           "id",
		DirectoryGroupsID:            "directory_groups_id",
		GroupCreatedOn:               "group_created_on",
		GroupAuthorizationsRuleID:    "group_authorization_rules_id",
		GroupAuthorizationsRuleGroup: "group_authorization_rules_group",
		CreatedOn:                    "created_on",
		DeactivatedOn:                "deactivated_on",
	}
}
