package interfaces

import (
	"context"

	intdoment "github.com/icipe-official/Data-Abstraction-Platform/internal/domain/entities"
)

type CreateSuperUserRepository interface {
	// Will return error if more than one row is returned.
	RepoIamCredentialsGetOneByColumnValueEquality(ctx context.Context, repoFieldColumnName string) (*intdoment.IamCredentials, error)
}

type CreateSuperUserService interface {
	ServiceGetIamCredentials(ctx context.Context) (*intdoment.IamCredentials, error)
}
