package postgres

import (
	"context"
	"fmt"
	"log/slog"

	intdoment "github.com/icipe-official/Data-Abstraction-Platform/internal/domain/entities"
	intlib "github.com/icipe-official/Data-Abstraction-Platform/internal/lib"
	"github.com/jackc/pgx/v5"
)

func (n *PostrgresRepository) RepoMetadataModelDefaultsUpsertMany(ctx context.Context, data []intdoment.MetadataModelsDefaults) (int, error) {
	query := fmt.Sprintf(
		"INSERT INTO %[1]s (%[2]s, %[3]s) VALUES ($1, $2) ON CONFLICT (%[2]s) DO UPDATE SET %[3]s = $2;",
		intdoment.MetadataModelsDefaultsRepository().RepositoryName, //1
		intdoment.MetadataModelsDefaultsRepository().ID,             //2
		intdoment.MetadataModelsDefaultsRepository().Description,    //3
	)
	n.logger.Log(ctx, slog.LevelDebug, query, "function", intlib.FunctionName(n.RepoMetadataModelDefaultsUpsertMany))

	successfulUpserts := 0
	for _, datum := range data {
		_, err := n.db.Exec(ctx, query, datum.ID[0], datum.Description[0])
		if err != nil && err != pgx.ErrNoRows {
			return successfulUpserts, intlib.FunctionNameAndError(n.RepoMetadataModelDefaultsUpsertMany, fmt.Errorf("insert metadata_model_defaults failed, err: %v", err))
		}
		successfulUpserts += 1
	}

	return successfulUpserts, nil
}
