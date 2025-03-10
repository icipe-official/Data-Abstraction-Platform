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

	export function GetOpenidName(iamCredential: Interface, defaultValue: string = '#noname') {
		if (Array.isArray(iamCredential.openid_user_info) && iamCredential.openid_user_info.length > 0) {
			if (
				Array.isArray(iamCredential.openid_user_info[0].openid_family_name) && iamCredential.openid_user_info[0].openid_family_name.length > 0 &&
				Array.isArray(iamCredential.openid_user_info[0].openid_given_name) && iamCredential.openid_user_info[0].openid_given_name.length > 0
			) {
				return `${iamCredential.openid_user_info[0].openid_family_name[0]} ${iamCredential.openid_user_info[0].openid_given_name[0]}`
			}
			if (Array.isArray(iamCredential.openid_user_info[0].openid_preferred_username) && iamCredential.openid_user_info[0].openid_preferred_username.length > 0) {
				return iamCredential.openid_user_info[0].openid_preferred_username[0]
			}
		}

		return defaultValue
	}
}

export default _IamCredentials
