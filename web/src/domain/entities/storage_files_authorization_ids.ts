namespace _StorageFilesAuthorizationIDs {
	export enum FieldColumn {
		ID = 'id',
		CreationIamGroupAuthorizationsID = 'creation_iam_group_authorizations_id',
		DeactivationIamGroupAuthorizationsID = 'deactivation_iam_group_authorizations_id'
	}

	export const RepositoryName = 'storage_files_authorization_ids'

	export interface Interface {
		id?: string[]
		creation_iam_group_authorizations_id?: string[]
		deactivation_iam_group_authorizations_id?: string[]
	}
}

export default _StorageFilesAuthorizationIDs
