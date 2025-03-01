namespace _MetadataModelsDefaults {
	export enum FieldColumn {
		ID = 'id',
		Description = 'description',
		MetadataModelID = 'metadata_models_id'
	}

	export const RepositoryName = 'metadata_models_defaults'

	export interface Interface {
		id?: string[]
		description?: string[]
		metadata_models_id?: string[]
	}
}

export default _MetadataModelsDefaults
