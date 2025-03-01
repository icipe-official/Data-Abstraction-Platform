namespace _IamGroupAuthorizations {
	export enum FieldColumn {
		ID = 'id',
		IamCredentialsID = 'iam_credentials_id',
		GroupRuleAuthorizationsID = 'group_rule_authorizations_id',
		CreatedOn = 'created_on',
		DeactivatedOn = 'deactivated_on'
	}

	export const RepositoryName = 'iam_group_authorizations'

	export interface Interface {
		id?: string[]
		iam_credentials_id?: string[]
		group_rule_authorizations_id?: string[]
		created_on?: string[]
		deactivated_on?: string[]
	}
}

export default _IamGroupAuthorizations
