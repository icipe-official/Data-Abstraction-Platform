namespace _AbstractionsReviews {
	export enum FieldColumn {
		AbstractionsID = 'abstractions_id',
		DirectoryID = 'directory_id',
		Pass = 'pass',
		CreatedOn = 'created_on',
		LastUpdatedOn = 'last_updated_on',
		CreationIamGroupAuthorizationsID = 'creation_iam_group_authorizations_id'
	}

	export const RepositoryName = 'abstractions_reviews'

	export interface Interface {
		abstractions_reviews_id?: {
			abstractions_id?: string[]
			directory_id?: string[]
		}[]
		pass?: boolean[]
		created_on?: string[]
		last_updated_on?: string[]
		creation_iam_group_authorizations_id?: string[]
	}
}

export default _AbstractionsReviews
