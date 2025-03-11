namespace _GroupAuthorizationRules {
	export enum FieldColumn {
		ID = 'id',
		RuleGroup = 'rule_group',
		Description = 'description',
		CreatedOn = 'created_on',
		LastUpdatedOn = 'last_updated_on',
		FullTextSearch = 'full_text_search'
	}

	export const RepositoryName = 'group_authorization_rules'

	export interface Interface {
		group_authorization_rules_id?: {
			id?: string[]
			rule_group?: string[]
		}[]
		description?: string[]
		created_on?: string[]
		last_updated_on?: string[]
	}
}

export default _GroupAuthorizationRules
