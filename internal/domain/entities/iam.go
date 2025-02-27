package entities

import (
	"github.com/gofrs/uuid/v5"
)

type IamGroupAuthorizationRule struct {
	ID        string `json:"id"`
	RuleGroup string `json:"rule_group"`
}

type IamAuthInfo struct {
	IamCredentials
	SessionID string
}

// formed by joining fields in iamGroupAuthorizationsRepository and groupAuthorizationRulesRepository.
type IamAuthorizationRule struct {
	ID                          uuid.UUID `json:"id,omitempty"`
	DirectoryGroupID            uuid.UUID `json:"directory_group_id,omitempty"`
	GroupAuthorizationRuleID    string    `json:"group_authorization_rule_id,omitempty"`
	GroupAuthorizationRuleGroup string    `json:"group_authorization_rule_group,omitempty"`
}

type IamAuthorizationRules map[string]*IamAuthorizationRule

const (
	AUTH_RULE_GROUP_APP_INSTANCES                 string = "app_instances"
	AUTH_RULE_GROUP_GROUP_RULE_AUTHORIZATION      string = "group_rule_authorization"
	AUTH_RULE_GROUP_IAM_GROUP_AUTHORIZATION       string = "iam_group_authorization"
	AUTH_RULE_GROUP_DIRECTORY_GROUPS              string = "directory_groups"
	AUTH_RULE_GROUP_DIRECTORY_GROUPS_TYPES        string = "directory_groups_types"
	AUTH_RULE_GROUP_DIRECTORY                     string = "directory"
	AUTH_RULE_GROUP_IAM_CREDENTIALS               string = "iam_credentials"
	AUTH_RULE_GROUP_METADATA_MODELS               string = "metadata_models"
	AUTH_RULE_GROUP_METADATA_MODELS_DEFAULTS      string = "metadata_models_defaults"
	AUTH_RULE_GROUP_STORAGE_DRIVES                string = "storage_drives"
	AUTH_RULE_GROUP_STORAGE_FILES                 string = "storage_files"
	AUTH_RULE_GROUP_INVENTORY                     string = "inventory"
	AUTH_RULE_GROUP_INVENTORY_STOCK               string = "inventory_stock"
	AUTH_RULE_GROUP_INVENTORY_STOCK_GROUP         string = "inventory_stock_group"
	AUTH_RULE_GROUP_INVENTORY_STOCK_KEEPING_UNITS string = "inventory_stock_keeping_units"
	AUTH_RULE_GROUP_CHAT_CHANNELS                 string = "chat_channels"
	AUTH_RULE_GROUP_CHAT_MESSAGES                 string = "chat_messages"
	AUTH_RULE_GROUP_CHAT_BOTS                     string = "chat_bots"

	AUTH_RULE_CREATE                 string = "create"
	AUTH_RULE_ASSIGN_CREATE          string = "assign_create"
	AUTH_RULE_CREATE_OTHERS          string = "create_others"
	AUTH_RULE_ASSIGN_CREATE_OTHERS   string = "assign_create_others"
	AUTH_RULE_RETRIEVE_SELF          string = "retrieve_self"
	AUTH_RULE_ASSIGN_RETRIEVE_SELF   string = "assign_retrieve_self"
	AUTH_RULE_RETRIEVE               string = "retrieve"
	AUTH_RULE_ASSIGN_RETRIEVE        string = "assign_retrieve"
	AUTH_RULE_RETRIEVE_OTHERS        string = "retrieve_others"
	AUTH_RULE_ASSIGN_RETRIEVE_OTHERS string = "assign_retrieve_others"
	AUTH_RULE_UPDATE                 string = "update"
	AUTH_RULE_ASSIGN_UPDATES         string = "assign_update"
	AUTH_RULE_UPDATE_SELF            string = "update_self"
	AUTH_RULE_ASSIGN_UPDATE_SELF     string = "assign_update_self"
	AUTH_RULE_UPDATE_OTHERS          string = "update_others"
	AUTH_RULE_ASSIGN_UPDATE_OTHERS   string = "assign_update_others"
	AUTH_RULE_DELETE                 string = "delete"
	AUTH_RULE_ASSIGN_DELETE          string = "assign_delete"
	AUTH_RULE_DELETE_SELF            string = "delete_self"
	AUTH_RULE_ASSIGN_DELETE_SELF     string = "assign_delete_self"
	AUTH_RULE_DELETE_OTHERS          string = "delete_others"
	AUTH_RULE_ASSIGN_DELETE_OTHERS   string = "assign_delete_others"
	AUTH_RULE_ASSIGN_ALL             string = "assign_all"
)
