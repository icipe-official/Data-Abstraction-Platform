namespace _IamCredentialsSessions {
	export enum FieldColumn {
		OpenidSid = 'openid_sid',
		OpenidSub = 'openid_sub',
		CreatedOn = 'created_on',
		ExpiresOn = 'expires_on'
	}

	export const RepositoryName = 'iam_credentials_sessions'

	export interface Interface {
		openid_sid?: string[]
		openid_sub?: string[]
		created_on?: string[]
		expires_on?: string[]
	}
}

export default _IamCredentialsSessions
