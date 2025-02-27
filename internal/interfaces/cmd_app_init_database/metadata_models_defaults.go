package initdatabase

import (
	"context"

	intdoment "github.com/icipe-official/Data-Abstraction-Platform/internal/domain/entities"
)

func (n *CmdInitDatabaseService) ServiceMetadataModelDefaultsCreate(ctx context.Context, data []intdoment.MetadataModelsDefaults) (int, error) {
	return n.repo.RepoMetadataModelDefaultsUpsertMany(ctx, data)
}
