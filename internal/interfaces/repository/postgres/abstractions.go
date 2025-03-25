package postgres

import (
	"context"
	"fmt"
	"log/slog"

	"github.com/gofrs/uuid/v5"
	intdoment "github.com/icipe-official/Data-Abstraction-Platform/internal/domain/entities"
	intlib "github.com/icipe-official/Data-Abstraction-Platform/internal/lib"
	"github.com/jackc/pgx/v5"
)

func (n *PostrgresRepository) RepoMetadataModelFindOneByAbstractionsDirectoryGroupsID(ctx context.Context, directoryGroupID uuid.UUID) (map[string]any, error) {
	query := fmt.Sprintf(
		"SELECT %[1]s.%[2]s FROM %[1]s INNER JOIN %[3]s ON %[3]s.%[4]s = $1 AND %[3]s.%[5]s = %[1]s.%[6]s;",
		intdoment.MetadataModelsRepository().RepositoryName,                 //1
		intdoment.MetadataModelsRepository().Data,                           //2
		intdoment.AbstractionsDirectoryGroupsRepository().RepositoryName,    //3
		intdoment.AbstractionsDirectoryGroupsRepository().DirectoryGroupsID, //4
		intdoment.AbstractionsDirectoryGroupsRepository().MetadataModelsID,  //5
		intdoment.MetadataModelsRepository().ID,                             //6
	)
	n.logger.Log(ctx, slog.LevelDebug, query, "function", intlib.FunctionName(n.RepoMetadataModelFindOneByAbstractionsDirectoryGroupsID))
	value := make(map[string]any)
	if err := n.db.QueryRow(ctx, query, directoryGroupID).Scan(&value); err != nil {
		if err == pgx.ErrNoRows {
			return nil, nil
		}
		errmsg := fmt.Errorf("get %s failed, error: %v", intdoment.AbstractionsDirectoryGroupsRepository().RepositoryName, err)
		n.logger.Log(ctx, slog.LevelDebug, errmsg.Error(), "function", intlib.FunctionName(n.RepoMetadataModelFindOneByAbstractionsDirectoryGroupsID))
		return nil, errmsg
	}

	return value, nil
}
