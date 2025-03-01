namespace _AbstractionsReviewsComments {
	export enum FieldColumn {
		ID = 'id',
		AbstractionsID = 'abstractions_id',
		DirectoryID = 'directory_id',
		Comment = 'comment',
		CreatedOn = 'created_on',
		CreationIamGroupAuthorizationsID = 'creation_iam_group_authorizations_id'
	}

	export const RepositoryName = 'abstractions_reviews_comments'

	export interface Interface {
		id?: string[]
		abstractions_id?: string[]
		directory_id?: string[]
		comment?: any[]
		created_on?: string[]
		creation_iam_group_authorizations_id?: string[]
	}
}

export default _AbstractionsReviewsComments
