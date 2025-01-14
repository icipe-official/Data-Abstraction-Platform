namespace _IamGroupAuthorizations {
	export enum Column {
		ID = 'id',
		IamCredentialsID = 'iam_credentials_id',
		GroupRuleAuthorizationsID = 'group_rule_authorizations_id',
		CreatedOn = 'created_on',
		DeactivatedOn = 'deactivated_on'
	}

	export const TableName = 'iam_group_authorizations'

	export interface Interface {
		id?: string[]
		iam_credentials_id?: string[]
		group_rule_authorizations_id?: string[]
		created_on?: string[]
		deactivated_on?: string[]
	}
}

export default _IamGroupAuthorizations
