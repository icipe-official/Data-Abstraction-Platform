namespace _StorageDrivesGroups {
	export enum Column {
		StorageDrivesID = 'storage_drives_id',
		DirectoryGroupsID = 'directory_groups_id',
		Description = 'description',
		CreatedOn = 'created_on',
		LastUpdatedOn = 'last_updated_on',
		DeactivatedOn = 'deactivated_on'
	}

	export const TableName = 'storage_drives_groups'

	export interface Interface {
		storage_drives_id?: string[]
		directory_groups_id?: string[]
		description?: string[]
		created_on?: string[]
		last_updated_on?: string[]
		deactivated_on?: string[]
	}
}

export default _StorageDrivesGroups
