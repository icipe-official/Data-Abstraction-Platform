namespace _MetadataModelsDirectoryGroups {
	export enum FieldColumn {
		DirectoryGroupsID = 'directory_groups_id',
		MetadataModelsID = 'metadata_models_id',
		CreatedOn = 'created_on',
		LastUpdatedOn = 'last_updated_on'
	}

	export const RepositoryName = 'metadata_models_directory_groups'

	export interface Interface {
		directory_groups_id?: string[]
		metadata_models_id?: string[]
		created_on?: string[]
		last_updated_on?: string[]
	}
}

export default _MetadataModelsDirectoryGroups
