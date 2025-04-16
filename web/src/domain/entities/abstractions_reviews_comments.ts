namespace _AbstractionsReviewsComments {
	export enum FieldColumn {
		ID = 'id',
		AbstractionsID = 'abstractions_id',
		DirectoryID = 'directory_id',
		Comment = 'comment',
		CreatedOn = 'created_on',
		LastUpdatedOn = 'last_updated_on'
	}

	export const RepositoryName = 'abstractions_reviews'

	export interface Interface {
		id?: string[]
		abstractions_id?: string[]
		directory_id?: string[]
		comment?: string[]
		created_on?: string[]
		last_updated_on?: string[]
	}
}

export default _AbstractionsReviewsComments
