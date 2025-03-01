namespace _IamCredentials {
	export enum FieldColumn {
		ID = 'id',
		DirectoryID = 'directory_id',
		OpenidSub = 'openid_sub',
		OpenidPreferredUsername = 'openid_preferred_username',
		OpenidEmail = 'openid_email',
		OpenidEmailVerified = 'openid_email_verified',
		OpenidGivenName = 'openid_given_name',
		OpenidFamilyName = 'openid_family_name',
		CreatedOn = 'created_on',
		LastUpdatedOn = 'last_updated_on',
		DeactivatedOn = 'deactivated_on'
	}

	export const RepositoryName = 'iam_credentials'

	export interface Interface {
		id?: string[]
		directory_id?: string[]
		openid_user_info?: {
			openid_sub?: string[]
			openid_preferred_username?: string[]
			openid_email?: string[]
			openid_email_verified?: boolean[]
			openid_given_name?: string[]
			openid_family_name?: string[]
		}[]
		created_on?: string[]
		last_updated_on?: string[]
		deactivated_on?: string[]
	}
}

export default _IamCredentials
