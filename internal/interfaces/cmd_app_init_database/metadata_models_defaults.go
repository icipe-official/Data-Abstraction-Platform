package initdatabase

import (
	"context"

	"github.com/go-chi/httplog/v2"
	intdoment "github.com/icipe-official/Data-Abstraction-Platform/internal/domain/entities"
)

func (n *CmdInitDatabaseService) ServiceMetadataModelDefaultsCreate(ctx context.Context, logger *httplog.Logger, data []intdoment.MetadataModelsDefaults) (int, error) {
	return n.repo.RepoMetadataModelDefaultsInsertMany(ctx, logger, data)
}
