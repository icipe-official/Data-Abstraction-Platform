namespace _StorageDrives {
	export enum FieldColumn {
		ID = 'id',
		StorageDriveTypeID = 'storage_drive_types_id',
		Description = 'description',
		Data = 'data',
		CreatedOn = 'created_on',
		LastUpdatedOn = 'last_updated_on',
		DeactivatedOn = 'deactivated_on'
	}

	export const RepositoryName = 'storage_drives'

	export interface Interface {
		id?: string[]
		storage_drive_types_id?: string[]
		description?: string[]
		data?: any[]
		created_on?: string[]
		last_updated_on?: string[]
		deactivated_on?: string[]
	}
}

export default _StorageDrives
