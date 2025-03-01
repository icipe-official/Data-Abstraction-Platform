package postgres

import (
	"context"
	"fmt"
	"log/slog"

	intdoment "github.com/icipe-official/Data-Abstraction-Platform/internal/domain/entities"
	intlib "github.com/icipe-official/Data-Abstraction-Platform/internal/lib"
)

func (n *PostrgresRepository) RepoStorageDrivesTypesUpsertOne(ctx context.Context, data *intdoment.StorageDrivesTypes) error {
	query := fmt.Sprintf(
		"INSERT INTO %[1]s (%[2]s, %[3]s) VALUES ($1, $2) ON CONFLICT (%[2]s) DO UPDATE SET %[3]s = $2;",
		intdoment.StorageDrivesTypesRepository().RepositoryName, //1
		intdoment.StorageDrivesTypesRepository().ID,             //2
		intdoment.StorageDrivesTypesRepository().Description,    //3
	)
	n.logger.Log(ctx, slog.LevelDebug, query, "function", intlib.FunctionName(n.RepoStorageDrivesTypesUpsertOne))

	if _, err := n.db.Exec(ctx, query, data.ID[0], data.Description[0]); err != nil {
		return intlib.FunctionNameAndError(n.RepoStorageDrivesTypesUpsertOne, fmt.Errorf("insert storage_drive_type failed, err: %v", err))
	}

	return nil
}
