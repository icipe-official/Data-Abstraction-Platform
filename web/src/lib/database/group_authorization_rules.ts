namespace _GroupAuthorizationRules {
	export enum Column {
		ID = 'id',
		RuleGroup = 'rule_group',
		Description = 'description',
		Tags = 'tags',
		CreatedOn = 'created_on',
		LastUpdatedOn = 'last_updated_on',
		FullTextSearch = 'full_text_search'
	}

	export const TableName = 'group_authorization_rules'

	export interface Interface {
		group_authorization_rules_id?: {
			id?: string[]
			rule_group?: string[]
		}[]
		description?: string[]
		tags?: string[]
		created_on?: string[]
		last_updated_on?: string[]
	}
}

export default _GroupAuthorizationRules
