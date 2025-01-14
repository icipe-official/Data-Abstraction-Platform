namespace _StorageFiles {
	export enum Column {
		ID = 'id',
		StorageDrivesID = 'storage_drives_id',
		DirectoryGroupsID = 'directory_groups_id',
		StorageFileMimeType = 'storage_file_mime_type',
		OriginalName = 'original_name',
		Tags = 'tags',
		EditAuthorized = 'edit_authorized',
		EditUnauthorized = 'edit_unauthorized',
		ViewAuthorized = 'view_authorized',
		ViewUnauthorized = 'view_unauthorized',
		CreatedOn = 'created_on',
		LastUpdatedOn = 'last_updated_on',
		DeactivatedOn = 'deactivated_on',
		FullTextSearch = 'full_text_search'
	}

	export const TableName = 'storage_files'

	export interface Interface {
		id?: string[]
		storage_drives_id?: string[]
		directory_groups_id?: string[]
		storage_file_mime_type?: string[]
		original_name?: string[]
		tags?: string[]
		edit_authorized?: boolean[]
		edit_unauthorized?: boolean[]
		view_authorized?: boolean[]
		view_unauthorized?: boolean[]
		created_on?: string[]
		last_updated_on?: string[]
		deactivated_on?: string[]
		full_text_search?: string[]
	}
}

export default _StorageFiles
