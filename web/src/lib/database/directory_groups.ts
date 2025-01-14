namespace _DirectoryGroups {
	export enum Column {
		ID = 'id',
		Data = 'data',
		CreatedOn = 'created_on',
		LastUpdatedOn = 'last_updated_on',
		DeactivatedOn = 'deactivated_on',
		FullTextSearch = 'full_text_search'
	}

	export const TableName = 'directory_groups'

	export interface Interface {
		id?: string[]
		data?: any[]
		created_on?: string[]
		last_updated_on?: string[]
		deactivated_on?: string[]
	}
}

export default _DirectoryGroups
