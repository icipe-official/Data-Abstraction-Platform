package postgres

import (
	"context"

	intdoment "github.com/icipe-official/Data-Abstraction-Platform/internal/domain/entities"
)

func (n *PostrgresRepository) RepoIamCredentialsGetOneByColumnValueEquality(ctx context.Context, repoFieldColumnName string) (*intdoment.IamCredentials, error) {

}
