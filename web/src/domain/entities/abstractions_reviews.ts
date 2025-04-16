namespace _AbstractionsReviews {
	export enum FieldColumn {
		AbstractionsID = 'abstractions_id',
		DirectoryID = 'directory_id',
		ReviewPass = 'review_pass',
		CreatedOn = 'created_on',
		LastUpdatedOn = 'last_updated_on'
	}

	export const RepositoryName = 'abstractions_reviews'

	export interface Interface {
		abstractions_id?: string[]
		directory_id?: string[]
		review_pass?: boolean[]
		created_on?: string[]
		last_updated_on?: string[]
	}
}

export default _AbstractionsReviews
