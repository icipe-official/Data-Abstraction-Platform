package interfaces

import (
	"context"

	"github.com/gofrs/uuid/v5"
	intdoment "github.com/icipe-official/Data-Abstraction-Platform/internal/domain/entities"
)

type RouteIamGroupAuthorizationsRepository interface {
	RepoIamGroupAuthorizationsSearch(
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
}
