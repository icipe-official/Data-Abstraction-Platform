namespace _StorageDrivesGroupAuthorizationIDs {
	export enum FieldColumn {
		StorageDrivesID = 'storage_drives_id',
		DirectoryGroupsID = 'directory_groups_id',
		CreationIamGroupAuthorizationsID = 'creation_iam_group_authorizations_id',
		DeactivationIamGroupAuthorizationsID = 'deactivation_iam_group_authorizations_id'
	}

	export const RepositoryName = 'storage_drives_groups_authorization_ids'

	export interface Interface {
		storage_drives_id?: string[]
		directory_groups_id?: string[]
		creation_iam_group_authorizations_id?: string[]
		deactivation_iam_group_authorizations_id?: string[]
	}
}

export default _StorageDrivesGroupAuthorizationIDs
