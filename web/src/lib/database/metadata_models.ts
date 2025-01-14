namespace _MetadataModels {
	export enum Column {
		ID = 'id',
		DirectoryGroupsID = 'directory_groups_id',
		DirectoryID = 'directory_id',
		Name = 'name',
		Description = 'description',
		EditAuthorized = 'edit_authorized',
		EditUnauthorized = 'edit_unauthorized',
		ViewAuthorized = 'view_authorized',
		ViewUnauthorized = 'view_unauthorized',
		Tags = 'tags',
		Data = 'metadata_model',
		CreatedOn = 'created_on',
		LastUpdatedOn = 'last_updated_on',
		DeactivatedOn = 'deactivated_on',
		FullTextSearch = 'full_text_search'
	}

	export const TableName = 'metadata_models'

	export interface Interface {
		id?: string[]
		directory_groups_id?: string[]
		directory_id?: string[]
		name?: string[]
		description?: string[]
		edit_authorized?: boolean[]
		edit_unauthorized?: boolean[]
		view_authorized?: boolean[]
		view_unauthorized?: boolean[]
		tags?: string[]
		data?: any[]
		created_on?: string[]
		last_updated_on?: string[]
		deactivated_on?: string[]
	}
}

export default _MetadataModels
