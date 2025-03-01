namespace _AbstractionsDirectoryGroups {
	export enum FieldColumn {
		DirectoryGroupsID = 'directory_groups_id',
		MetadataModelsID = 'metadata_models_id',
		Description = 'description',
		AbstractionReviewQuorum = 'abstraction_review_quorum',
		CreatedOn = 'created_on',
		LastUpdatedOn = 'last_updated_on',
		DeactivatedOn = 'deactivated_on'
	}

	export const RepositoryName = 'abstractions_directory_groups'

	export interface Interface {
		directory_groups_id?: string[]
		metadata_models_id?: string[]
		description?: string[]
		abstraction_review_quorum?: number[]
		created_on?: string[]
		last_updated_on?: string[]
		deactivated_on?: string[]
	}
}

export default _AbstractionsDirectoryGroups
