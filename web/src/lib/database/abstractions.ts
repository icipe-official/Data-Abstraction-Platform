namespace _Abstractions {
	export enum Column {
		ID = 'id',
		DirectoryGroupsID = 'directory_groups_id',
		MetadataModelsID = 'metadata_models_id',
		DirectoryID = 'directory_id',
		StorageFilesID = 'storage_files_id',
		Tags = 'tags',
		Data = 'data',
		AbstractionsReviewsPass = 'abstractions_reviews_pass',
		CreatedOn = 'created_on',
		LastUpdatedOn = 'last_updated_on',
		DeactivatedOn = 'deactivated_on'
	}

	export const TableName = 'abstractions'

	export interface Interface {
		id?: string[]
		directory_groups_id?: string[]
		metadata_models_id?: string[]
		directory_id?: string[]
		storage_files_id?: string[]
		tags?: string[]
		data?: any[]
		abstractions_reviews_pass?: boolean[]
		created_on?: string[]
		last_updated_on?: string[]
		deactivated_on?: string[]
	}
}

export default _Abstractions
