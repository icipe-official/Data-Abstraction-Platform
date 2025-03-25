namespace _Abstractions {
	export enum FieldColumn {
		ID = 'id',
		DirectoryGroupsID = 'directory_groups_id',
		DirectoryID = 'directory_id',
		StorageFilesID = 'storage_files_id',
		ReviewPass = 'review_pass',
		Tags = 'tags',
		Data = 'data',
		CreatedOn = 'created_on',
		LastUpdatedOn = 'last_updated_on',
		DeactivatedOn = 'deactivated_on'
	}

	export const RepositoryName = 'abstractions'

	export interface Interface {
		id?: string[]
		directory_groups_id?: string[]
		metadata_models_id?: string[]
		directory_id?: string[]
		storage_files_id?: string[]
		review_pass?: boolean[]
		tags?: string[]
		data?: any[]
		created_on?: string[]
		last_updated_on?: string[]
		deactivated_on?: string[]
	}
}

export default _Abstractions
