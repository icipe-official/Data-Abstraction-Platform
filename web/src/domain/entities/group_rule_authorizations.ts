namespace _GroupRuleAuthorizations {
	export enum FieldColumn {
		ID = 'id',
		DirectoryGroupsID = 'directory_groups_id',
		GroupAuthorizationRuleID = 'group_authorization_rules_id',
		GroupAuthorizationRuleGroup = 'group_authorization_rules_group',
		CreatedOn = 'created_on',
		DeactivatedOn = 'deactivated_on'
	}

	export const RepositoryName = 'group_rule_authorizations'

	export interface Interface {
		id?: string[]
		directory_groups_id?: string[]
		group_rule_authorizations_id?: {
			group_authorization_rules_id?: string[]
			group_authorization_rules_group?: string[]
		}[]
		created_on?: string[]
		deactivated_on?: string[]
	}
}

export default _GroupRuleAuthorizations
