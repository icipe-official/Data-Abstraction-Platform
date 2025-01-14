namespace _StorageDrivesTypes {
	export enum Column {
		ID = 'id',
		Description = 'description'
	}

	export const TableName = 'storage_drives_types'

	export interface Interface {
		id?: string[]
		description?: string[]
		storage_drive_type?: any[]
	}
}

export default _StorageDrivesTypes
