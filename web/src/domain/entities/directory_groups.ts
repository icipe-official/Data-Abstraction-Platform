namespace _DirectoryGroups {
	export enum FieldColumn {
		ID = 'id',
		Data = 'data',
		CreatedOn = 'created_on',
		LastUpdatedOn = 'last_updated_on',
		DeactivatedOn = 'deactivated_on',
		FullTextSearch = 'full_text_search'
	}

	export const RepositoryName = 'directory_groups'

	export interface Interface {
		id?: string[]
		data?: any[]
		created_on?: string[]
		last_updated_on?: string[]
		deactivated_on?: string[]
	}

	export const RepositorySearchMetadatamodelUrl = `${import.meta.env.VITE_WEB_SERVICE_API_CORE_URL}/directory-groups/search/metadata-model`
	export const RepositorySearchUrl = `${import.meta.env.VITE_WEB_SERVICE_API_CORE_URL}/directory-groups/search`
}

export default _DirectoryGroups
