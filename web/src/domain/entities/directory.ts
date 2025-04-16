namespace _Directory {
	export enum FieldColumn {
		ID = 'id',
		DirectoryGroupsID = 'directory_groups_id',
		DisplayName = 'display_name',
		Data = 'data',
		CreatedOn = 'created_on',
		LastUpdatedOn = 'last_updated_on',
		DeactivatedOn = 'deactivated_on',
		FullTextSearch = 'full_text_search'
	}

	export const RepositoryName = 'directory'

	export interface Interface {
		id?: string[]
		directory_groups_id?: string[]
		display_name?: string[]
		data?: any[]
		created_on?: string[]
		last_updated_on?: string[]
		deactivated_on?: string[]
	}
}

export default _Directory
