namespace _MetadataModelsDefaults {
	export enum Column {
		ID = 'id',
		Description = 'description',
		MetadataModelID = 'metadata_models_id'
	}

	export const TableName = 'metadata_models_defaults'

	export interface Interface {
		id?: string[]
		description?: string[]
		metadata_models_id?: string[]
	}
}

export default _MetadataModelsDefaults
