namespace _StorageDrivesTypes {
	export enum FieldColumn {
		ID = 'id',
		Description = 'description'
	}

	export const RepositoryName = 'storage_drives_types'

	export interface Interface {
		id?: string[]
		description?: string[]
		storage_drive_type?: any[]
	}
}

export default _StorageDrivesTypes
