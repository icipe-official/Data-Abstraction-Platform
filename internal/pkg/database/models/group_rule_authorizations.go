package models

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

type groupRuleAuthorizationTable struct {
	TableName string

	ID                          string
	DirectoryGroupsID           string
	GroupCreatedOn              string
	GroupAuthorizationRuleID    string
	GroupAuthorizationRuleGroup string
	CreatedOn                   string
	DeactivatedOn               string
}

func GroupRuleAuthorizationTable() groupRuleAuthorizationTable {
	return groupRuleAuthorizationTable{
		TableName: "group_rule_authorization",

		ID:                          "id",
		DirectoryGroupsID:           "directory_groups_id",
		GroupCreatedOn:              "group_created_on",
		GroupAuthorizationRuleID:    "group_authorization_rule_id",
		GroupAuthorizationRuleGroup: "group_authorization_rule_group",
		CreatedOn:                   "created_on",
		DeactivatedOn:               "deactivated_on",
	}
}
