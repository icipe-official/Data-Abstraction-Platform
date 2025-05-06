export interface BreadCrumb {
	crumb: string
	path: string
}

export type FlatTableArrayValue = string | number | null

export type FormField = string | number | string[] | number[] | null

export interface ITemplateStructValue {
	struct: string
	value: FormField | object | object[]
}

export interface IFormKeyValue {
	key: string
	value: FormField
}

export interface IProjectStats {
	ProjectID: string
	NoOfMembers: number | null
	NoOfModelTemplates: number | null
	NoOfCatalogues: number | null
	NoOfFiles: number | null
	NoOfAbstractions: number | null
}

export interface IPlatformStats {
	NoOfProjects: number | null
	NoOfModelTemplates: number | null
	NoOfCatalogues: number | null
	NoOfAbstractions: number | null
}

export interface ISearchDirectory extends IDirectory_temp {
	ProjectsRoles?: IProjectsRoles[]
	SystemUser?: ISystemUser
	DirectoryIam?: IDirectoryIam
}

export interface IProjectsRoles extends IProject {
	ProjectRoles: IProjectRole[]
}

export interface IStorageTypes {
	ID: string
	Properties: string
}

export interface ISearchStorage {
	ID: string
	StorageTypeID: string
	StorageTypeProperties: string
	Name: string
	Storage: string
	IsActive: boolean
	CreatedOn: string
	LastUpdatedOn: string
}

export interface ISearchAbstraction {
	ID: string
	ModelTemplateID: string
	ModelTemplate?: IModelTemplate_temp
	FileID: string
	FileContentType: string
	FileTags: string
	AbstractorDirectoryID: string
	AbstractorDirectoryName: string
	AbstractorDirectoryContacts: string[]
	ProjectID: string
	Tags: string
	Abstraction: string
	IsVerified: boolean
	CreatedOn: string
	LastUpdatedOn: string
	AbstractionReviews:
		| {
				ReviewerDirectoryID: string
				ReviewerDirectoryName: string
				ReviewerDirectoryContacts: string[]
				Review: boolean
				ReviewCreatedOn: string
				ReviewLastUpdatedOn: string
		  }[]
		| null
	AbstractionReviewsComments:
		| {
				ID: string
				CommenterDirectoryID: string
				CommenterDirectoryName: string
				CommenterDirectoryContacts: string[]
				Comment: string
				CommentCreatedOn: string
		  }[]
		| null
}

export interface IAbstractionReviewComment {
	ID: string
	AbstractionID: string
	CommenterDirectoryID: string
	CommenterDirectoryName: string
	Comment: string
	CreatedOn: string
}

export interface IAbstractionReviewComment_temp {
	ID?: string
	AbstractionID?: string
	DirectoryID?: string
	Comment?: string
	CreatedOn?: string
}

export interface IAbstractionReview {
	AbstractionID: string
	DirectoryID: string
	Review: boolean
	CreatedOn: string
	LastUpdatedOn: string
}

export interface IAbstractionReview_temp {
	AbstractionID?: string
	DirectoryID?: string
	Review?: boolean
	CreatedOn?: string
	LastUpdatedOn?: string
}

export interface IAbstraction {
	ID: string
	ModelTemplateID: string
	FileID: string
	DirectoryID: string
	ProjectID: string
	Tags: string
	Abstraction: string
	IsVerified: boolean
	CreatedOn: string
	LastUpdatedOn: string
}

export interface IAbstraction_temp {
	ID?: string
	ModelTemplateID?: string
	FileID?: string
	DirectoryID?: string
	ProjectID?: string
	Tags?: string
	Abstraction?: string
	IsVerified?: boolean
	CreatedOn?: string
	LastUpdatedOn?: string
}

export interface IProjectStorage {
	StorageID: string
	ProjectID: string
	CreatedOn: string
	Storage: {
		StorageTypeID: string
		Name: string
	}
	Project: {
		Name: string
		Description: string
	}
}

export interface IProjectStorage_temp {
	StorageID?: string
	ProjectID?: string
	CreatedOn?: string
	Storage?: {
		StorageTypeID: string
		Name: string
	}
	Project?: {
		Name: string
		Description: string
	}
}

export interface IFile {
	ID: string
	StorageID: string
	ProjectID: string
	DirectoryID: string
	ContentType: string
	Tags: string
	CreatedOn: string
	Storage: {
		StorageTypeID: string
		Name: string
	}
	Directory: {
		Name: string
		Contacts: string[]
	}
	Project: {
		Name: string
		Description: string
	}
}

export interface IFile_temp {
	ID?: string
	StorageID?: string
	ProjectID?: string
	DirectoryID?: string
	ContentType?: string
	Tags?: string
	CreatedOn?: string
	Storage?: {
		StorageTypeID: string
		Name: string
	}
	Directory?: {
		Name: string
		Contacts: string[]
	}
	Project?: {
		Name: string
		Description: string
	}
}

export interface IModelTemplate {
	ID: string
	ProjectID: string
	DirectoryID: string
	TemplateName: string
	DataName: string
	Description: string
	ModelTemplate: string
	CreatedOn: string
	LastUpdatedOn: string
	VerificationQuorum: number
	CanPublicView: boolean
	Directory: {
		Name: string
		Contacts: string[]
	}
	Project: {
		Name: string
		Description: string
	}
}

export interface IModelTemplate_temp {
	ID?: string
	ProjectID?: string
	DirectoryID?: string
	TemplateName?: string
	DataName?: string
	Description?: string
	ModelTemplate?: string
	CreatedOn?: string
	LastUpdatedOn?: string
	VerificationQuorum?: number
	CanPublicView?: boolean
	Directory?: {
		Name: string
		Contacts: string[]
	}
	Project?: {
		Name: string
		Description: string
	}
}

export interface ICatalogue {
	ID: string
	ProjectID: string
	DirectoryID: string
	Name: string
	Description: string
	Catalogue: string[]
	CreatedOn: string
	LastUpdatedOn: string
	CanPublicView: boolean
	Directory: {
		Name: string
		Contacts: string[]
	}
	Project: {
		Name: string
		Description: string
	}
}

export interface ICatalogue_temp {
	ID?: string
	ProjectID?: string
	DirectoryID?: string
	Name?: string
	Description?: string
	Catalogue?: string[]
	CreatedOn?: string
	LastUpdatedOn?: string
	CanPublicView?: boolean
	Directory?: {
		Name: string
		Contacts: string[]
	}
	Project?: {
		Name: string
		Description: string
	}
}

export interface IDirectory {
	ID: string
	Name: string
	Contacts: string[]
	CreatedOn: string
	LastUpdatedOn: string
}

export interface IDirectory_temp {
	ID?: string
	Name?: string
	Contacts?: string[]
	CreatedOn?: string
	LastUpdatedOn?: string
}

export interface ISearchUser {
	ID: string
	Name: string
	Contacts: string[]
	CreatedOn: string
	LastUpdatedOn: string
	SystemUserCreatedOn: string
	IamEmail: string
	IamCreatedOn: string
	IamLastUpdatedOn: string
	ProjectsRoles:
		| {
				ProjectID: string
				ProjectName: string
				ProjectDescription: string
				ProjectCreatedOn: string
				ProjectRoles: {
					ProjectRoleID: string
					ProjectRoleCreatedOn: string
				}[]
		  }[]
		| null
}

export interface IProjectRole {
	DirectoryID: string
	ProjectID: string
	ProjectRoleID: string
	CreatedOn: string
}

export interface IProjectRole_temp {
	DirectoryID?: string
	ProjectID?: string
	ProjectRoleID?: string
	CreatedOn?: string
}

export interface IProject {
	ID: string
	DirectoryID: string
	Name: string
	Description: string
	CreatedOn: string
	LastUpdatedOn: string
	IsActive: boolean
	Directory: IDirectory | null | undefined
}

export interface IProject_temp {
	ID?: string
	DirectoryID?: string
	Name?: string
	Description?: string
	CreatedOn?: string
	LastUpdatedOn?: string
	IsActive?: boolean
	Directory?: IDirectory
}

export interface ISearchProject {
	ID: string
	Name: string
	Description: string
	CreatedOn: string
	LastUpdatedOn: string
	IsActive: boolean
	OwnerDirectoryID: string
	OwnerDirectoryName: string
	OwnerDirectoryContacts: string[]
	Storage:
		| {
				StorageID: string
				StorageName: string
		  }[]
		| null
}

export interface ICurrentProject {
	ProjectID: string
	ProjectName: string
	ProjectDescription: string
	ProjectCreatedOn: string
	ProjectRoles: {
		ProjectRoleID: string
		ProjectRoleCreatedOn: string
	}[]
}

interface ISystemUser {
	DirectoryID: string
	CreatedOn: string
}

interface IDirectoryIam {
	Email: string
	IsEmailVerified: string
	CreatedOn: string
	LastUpdatedOn: string
}

export interface ICurrentUser {
	DirectoryID: string
	IamEmail: string
	Name: string
	Contacts: string[]
	SystemUserCreatedOn: string | null
	ProjectsRoles:
		| {
				ProjectID: string
				ProjectName: string
				ProjectDescription: string
				ProjectCreatedOn: string
				ProjectRoles: {
					ProjectRoleID: string
					ProjectRoleCreatedOn: string
				}[]
		  }[]
		| null
}
