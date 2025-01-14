package models

import (
	"time"
)

type GroupAuthorizationRules struct {
	GroupAuthorizationRulesID []struct {
		ID        []string `sql:"primary_key" json:"id,omitempty"`
		RuleGroup []string `sql:"primary_key" json:"rule_group,omitempty"`
	} `json:"group_authorization_rules_id,omitempty"`
	Description   []string    `json:"description,omitempty"`
	Tags          []string    `json:"tags,omitempty"`
	CreatedOn     []time.Time `json:"created_on,omitempty"`
	LastUpdatedOn []time.Time `json:"last_updated_on,omitempty"`
}

type groupAuthorizationRulesTable struct {
	TableName string

	ID             string
	RuleGroup      string
	Description    string
	Tags           string
	CreatedOn      string
	LastUpdatedOn  string
	FullTextSearch string
}

func GroupAuthorizationRulesTable() groupAuthorizationRulesTable {
	return groupAuthorizationRulesTable{
		TableName: "group_authorization_rules",

		ID:             "id",
		RuleGroup:      "rule_group",
		Description:    "description",
		Tags:           "tags",
		CreatedOn:      "created_on",
		LastUpdatedOn:  "last_updated_on",
		FullTextSearch: "full_text_search",
	}
}
