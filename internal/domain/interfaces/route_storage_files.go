package interfaces

import (
	"context"
	"io"
	"net/http"

	"github.com/gofrs/uuid/v5"
	intdoment "github.com/icipe-official/Data-Abstraction-Platform/internal/domain/entities"
)

type RouteStorageFilesRepository interface {
	RepoStorageFilesDeleteOne(
		ctx context.Context,
		iamAuthRule *intdoment.IamAuthorizationRule,
		fileManagement FileManagement,
		datum *intdoment.StorageFiles,
		storageDrive *intdoment.StorageDrives,
	) error
	RepoStorageFilesFindOneForDeletionByID(
		ctx context.Context,
		iamCredential *intdoment.IamCredentials,
		iamAuthorizationRules *intdoment.IamAuthorizationRules,
		authContextDirectoryGroupID uuid.UUID,
		datum *intdoment.StorageFiles,
		columns []string,
	) (*intdoment.StorageFiles, *intdoment.IamAuthorizationRule, error)
	RepoStorageFilesUpdateOne(
		ctx context.Context,
		iamCredential *intdoment.IamCredentials,
		iamAuthorizationRules *intdoment.IamAuthorizationRules,
		authContextDirectoryGroupID uuid.UUID,
		datum *intdoment.StorageFiles,
	) error
	RepoStorageFilesInsertOne(
		ctx context.Context,
		iamAuthRule *intdoment.IamAuthorizationRule,
		fileManagement FileManagement,
		datum *intdoment.StorageFiles,
		storageDrive *intdoment.StorageDrives,
		directoryID uuid.UUID,
		file io.Reader,
		columns []string,
	) (*intdoment.StorageFiles, error)
	RepoStorageFilesSearch(
		ctx context.Context,
		mmsearch *intdoment.MetadataModelSearch,
		repo IamRepository,
		iamCredential *intdoment.IamCredentials,
		iamAuthorizationRules *intdoment.IamAuthorizationRules,
		startSearchDirectoryGroupID uuid.UUID,
		authContextDirectoryGroupID uuid.UUID,
		skipIfFGDisabled bool,
		skipIfDataExtraction bool,
		whereAfterJoin bool,
	) (*intdoment.MetadataModelSearchResults, error)
	RepoIamGroupAuthorizationsGetAuthorized(
		ctx context.Context,
		iamAuthInfo *intdoment.IamCredentials,
		authContextDirectoryGroupID uuid.UUID,
		groupAuthorizationRules []*intdoment.IamGroupAuthorizationRule,
		currentIamAuthorizationRules *intdoment.IamAuthorizationRules,
	) ([]*intdoment.IamAuthorizationRule, error)
	RepoDirectoryGroupsFindOneByIamCredentialID(ctx context.Context, iamCredentialID uuid.UUID, columns []string) (*intdoment.DirectoryGroups, error)
	RepoDirectoryGroupsFindSystemGroup(ctx context.Context, columns []string) (*intdoment.DirectoryGroups, error)
	RepoStorageDrivesFindOneActiveByStorageDrivesGroup(ctx context.Context, storageDrivesID uuid.UUID, directoryGroupsID uuid.UUID, columns []string) (*intdoment.StorageDrives, error)
}

type RouteStorageFilesWebsiteService interface {
	ServiceGetStorageFilePageHtml(
		ctx context.Context,
		websiteTemplate WebsiteTemplates,
		openid OpenID,
		partialRequest bool,
		partialName string,
		iamCredential *intdoment.IamCredentials,
		authContextDirectoryGroupID uuid.UUID,
		data any,
	) (*string, error)
	ServiceStorageFilesSearch(
		ctx context.Context,
		mmsearch *intdoment.MetadataModelSearch,
		repo IamRepository,
		iamCredential *intdoment.IamCredentials,
		iamAuthorizationRules *intdoment.IamAuthorizationRules,
		startSearchDirectoryGroupID uuid.UUID,
		authContextDirectoryGroupID uuid.UUID,
		skipIfFGDisabled bool,
		skipIfDataExtraction bool,
		whereAfterJoin bool,
	) (*intdoment.MetadataModelSearchResults, error)
	ServiceStorageFilesGetMetadataModel(ctx context.Context, metadataModelRetrieve MetadataModelRetrieve, targetJoinDepth int) (map[string]any, error)
	ServiceIamGroupAuthorizationsGetAuthorized(
		ctx context.Context,
		iamAuthInfo *intdoment.IamCredentials,
		authContextDirectoryGroupID uuid.UUID,
		groupAuthorizationRules []*intdoment.IamGroupAuthorizationRule,
		currentIamAuthorizationRules *intdoment.IamAuthorizationRules,
	) ([]*intdoment.IamAuthorizationRule, error)
	ServiceGetStorageFilesPageHtml(
		ctx context.Context,
		websiteTemplate WebsiteTemplates,
		openid OpenID,
		partialRequest bool,
		partialName string,
		iamCredential *intdoment.IamCredentials,
		authContextDirectoryGroupID uuid.UUID,
		data any,
	) (*string, error)
	ServiceDirectoryGroupsFindOneByIamCredentialID(ctx context.Context, iamCredentialID uuid.UUID) (*intdoment.DirectoryGroups, error)
}

type RouteStorageFilesApiCoreService interface {
	ServiceStorageFilesDeleteMany(
		ctx context.Context,
		iamCredential *intdoment.IamCredentials,
		iamAuthorizationRules *intdoment.IamAuthorizationRules,
		authContextDirectoryGroupID uuid.UUID,
		verboseResponse bool,
		data []*intdoment.StorageFiles,
		fileManagement FileManagement,
	) (int, *intdoment.MetadataModelVerbRes, error)
	ServiceStorageFilesUpdateMany(
		ctx context.Context,
		iamCredential *intdoment.IamCredentials,
		iamAuthorizationRules *intdoment.IamAuthorizationRules,
		authContextDirectoryGroupID uuid.UUID,
		verboseResponse bool,
		data []*intdoment.StorageFiles,
	) (int, *intdoment.MetadataModelVerbRes, error)
	ServiceStorageFilesDownload(ctx context.Context, storageFile *intdoment.StorageFiles, fileManagement FileManagement, w http.ResponseWriter) error
	ServiceStorageFileCreate(
		ctx context.Context,
		iamCredential *intdoment.IamCredentials,
		authContextDirectoryGroupID uuid.UUID,
		ffu FormFileUpload,
		fileManagement FileManagement,
	) (*intdoment.StorageFiles, error)
	ServiceIamGroupAuthorizationsGetAuthorized(
		ctx context.Context,
		iamAuthInfo *intdoment.IamCredentials,
		authContextDirectoryGroupID uuid.UUID,
		groupAuthorizationRules []*intdoment.IamGroupAuthorizationRule,
		currentIamAuthorizationRules *intdoment.IamAuthorizationRules,
	) ([]*intdoment.IamAuthorizationRule, error)
	ServiceStorageFilesSearch(
		ctx context.Context,
		mmsearch *intdoment.MetadataModelSearch,
		repo IamRepository,
		iamCredential *intdoment.IamCredentials,
		iamAuthorizationRules *intdoment.IamAuthorizationRules,
		startSearchDirectoryGroupID uuid.UUID,
		authContextDirectoryGroupID uuid.UUID,
		skipIfFGDisabled bool,
		skipIfDataExtraction bool,
		whereAfterJoin bool,
	) (*intdoment.MetadataModelSearchResults, error)
	ServiceStorageFilesGetMetadataModel(ctx context.Context, metadataModelRetrieve MetadataModelRetrieve, targetJoinDepth int) (map[string]any, error)
	ServiceDirectoryGroupsFindOneByIamCredentialID(ctx context.Context, iamCredentialID uuid.UUID) (*intdoment.DirectoryGroups, error)
}
