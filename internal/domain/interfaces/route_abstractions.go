package interfaces

import (
	"context"

	"github.com/gofrs/uuid/v5"
	intdoment "github.com/icipe-official/Data-Abstraction-Platform/internal/domain/entities"
)

type RouteAbstractionsRepository interface {
	RepoAbstractionsDeleteOne(
		ctx context.Context,
		iamAuthRule *intdoment.IamAuthorizationRule,
		datum *intdoment.Abstractions,
	) error
	RepoAbstractionsFindOneForDeletionByID(
		ctx context.Context,
		iamCredential *intdoment.IamCredentials,
		iamAuthorizationRules *intdoment.IamAuthorizationRules,
		authContextDirectoryGroupID uuid.UUID,
		datum *intdoment.Abstractions,
		columns []string,
	) (*intdoment.Abstractions, *intdoment.IamAuthorizationRule, error)
	RepoAbstractionsUpdateOne(
		ctx context.Context,
		iamCredential *intdoment.IamCredentials,
		iamAuthorizationRules *intdoment.IamAuthorizationRules,
		authContextDirectoryGroupID uuid.UUID,
		datum *intdoment.Abstractions,
	) error
	RepoAbstractionsInsertOne(
		ctx context.Context,
		iamAuthRule *intdoment.IamAuthorizationRule,
		directoryGroupID uuid.UUID,
		datum *intdoment.Abstractions,
		columns []string,
	) (*intdoment.Abstractions, error)
	RepoAbstractionsFindManyByAbstractionsDirectoryGroupsIDAndStorageFilesID(ctx context.Context, abstractionsDirectoryGroupsID uuid.UUID, storageFilesID uuid.UUID, columns []string) ([]*intdoment.Abstractions, error)
	RepoIamGroupAuthorizationsGetAuthorized(
		ctx context.Context,
		iamAuthInfo *intdoment.IamCredentials,
		authContextDirectoryGroupID uuid.UUID,
		groupAuthorizationRules []*intdoment.IamGroupAuthorizationRule,
		currentIamAuthorizationRules *intdoment.IamAuthorizationRules,
	) ([]*intdoment.IamAuthorizationRule, error)
	RepoAbstractionsSearch(
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
	RepoMetadataModelFindOneByAbstractionsDirectoryGroupsID(ctx context.Context, directoryGroupID uuid.UUID) (map[string]any, error)
	RepoDirectoryGroupsFindOneByIamCredentialID(ctx context.Context, iamCredentialID uuid.UUID, columns []string) (*intdoment.DirectoryGroups, error)
	RepoDirectoryGroupsFindSystemGroup(ctx context.Context, columns []string) (*intdoment.DirectoryGroups, error)
}

type RouteAbstractionsApiCoreService interface {
	ServiceAbstractionsDeleteMany(
		ctx context.Context,
		iamCredential *intdoment.IamCredentials,
		iamAuthorizationRules *intdoment.IamAuthorizationRules,
		authContextDirectoryGroupID uuid.UUID,
		verboseResponse bool,
		data []*intdoment.Abstractions,
	) (int, *intdoment.MetadataModelVerbRes, error)
	ServiceAbstractionsUpdateMany(
		ctx context.Context,
		iamCredential *intdoment.IamCredentials,
		iamAuthorizationRules *intdoment.IamAuthorizationRules,
		authContextDirectoryGroupID uuid.UUID,
		verboseResponse bool,
		data []*intdoment.Abstractions,
	) (int, *intdoment.MetadataModelVerbRes, error)
	ServiceAbstractionsInsertMany(
		ctx context.Context,
		iamCredential *intdoment.IamCredentials,
		iamAuthorizationRules *intdoment.IamAuthorizationRules,
		authContextDirectoryGroupID uuid.UUID,
		verboseResponse bool,
		data []*intdoment.Abstractions,
		doNotSkipIFAbstractionWithFileIDExists bool,
	) (int, *intdoment.MetadataModelVerbRes, error)
	ServiceAbstractionsMetadataModelGet(ctx context.Context, directoryGroupID uuid.UUID) (map[string]any, error)
	ServiceAbstractionsSearch(
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
	ServiceAbstractionsGetMetadataModel(ctx context.Context, metadataModelRetrieve MetadataModelRetrieve, targetJoinDepth int) (map[string]any, error)
	ServiceDirectoryGroupsFindOneByIamCredentialID(ctx context.Context, iamCredentialID uuid.UUID) (*intdoment.DirectoryGroups, error)
}

type RouteAbstractionsWebsiteService interface {
	ServiceAbstractionsSearch(
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
	ServiceAbstractionsGetMetadataModel(ctx context.Context, metadataModelRetrieve MetadataModelRetrieve, targetJoinDepth int) (map[string]any, error)
	ServiceGetAbstractionsPageHtml(
		ctx context.Context,
		websiteTemplate WebsiteTemplates,
		openid OpenID,
		partialRequest bool,
		partialName string,
		iamCredential *intdoment.IamCredentials,
		authContextDirectoryGroupID uuid.UUID,
		data any,
	) (*string, error)
	ServiceGetAbstractionPageHtml(
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
