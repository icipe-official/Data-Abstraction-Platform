package postgres

import (
	"context"
	"fmt"

	intdoment "github.com/icipe-official/Data-Abstraction-Platform/internal/domain/entities"
	"github.com/jackc/pgx/v5"
)

func (n *PostrgresRepository) RepoStorageTypesInsertOne(ctx context.Context, data *intdoment.StorageDrivesTypes) error {
	query := fmt.Sprintf(
		"INSERT INTO %[1]s (%[2]s, %[3]s) VALUES ($1, $2) ON CONFLICT (%[2]s) DO UPDATE SET %[3]s = $2;",
		intdoment.StorageDrivesTypesRepository().RepositoryName, //1
		intdoment.StorageDrivesTypesRepository().ID,             //2
		intdoment.StorageDrivesTypesRepository().Description,    //3
	)

	if _, err := n.db.Exec(ctx, query, data.ID[0], data.Description[0]); err != nil {
		return fmt.Errorf("insert storage_drive_type failed, err: %v", err)
	}

	return nil
}

func (n *PostrgresRepository) RepoGroupAuthorizationRulesInsertMany(ctx context.Context, data []intdoment.GroupAuthorizationRules) (int, error) {
	query := fmt.Sprintf(
		"INSERT INTO %[1]s (%[2]s, %[3]s, %[4]s) VALUES ($1, $2, $3) ON CONFLICT(%[2]s, %[3]s) DO UPDATE SET %[4]s = $3;",
		intdoment.GroupAuthorizationRulesRepository().RepositoryName, //1
		intdoment.GroupAuthorizationRulesRepository().ID,             //2
		intdoment.GroupAuthorizationRulesRepository().RuleGroup,      //3
		intdoment.GroupAuthorizationRulesRepository().Description,    //4
	)

	successfulUpserts := 0
	for _, datum := range data {
		if _, err := n.db.Exec(ctx, query, datum.GroupAuthorizationRulesID[0].ID[0], datum.GroupAuthorizationRulesID[0].RuleGroup[0], datum.Description[0]); err != nil {
			return successfulUpserts, err
		}
		successfulUpserts += 1
	}

	return successfulUpserts, nil
}

func (n *PostrgresRepository) RepoMetadataModelDefaultsInsertMany(ctx context.Context, data []intdoment.MetadataModelsDefaults) (int, error) {
	query := fmt.Sprintf(
		"INSERT INTO %[1]s (%[2]s, %[3]s) VALUES ($1, $2) ON CONFLICT (%[2]s) DO UPDATE SET %[3]s = $2;",
		intdoment.MetadataModelsDefaultsRepository().RepositoryName, //1
		intdoment.MetadataModelsDefaultsRepository().ID,             //2
		intdoment.MetadataModelsDefaultsRepository().Description,    //3
	)

	successfulUpserts := 0
	for _, datum := range data {
		_, err := n.db.Exec(ctx, query, datum.ID[0], datum.Description[0])
		if err != nil && err != pgx.ErrNoRows {
			return successfulUpserts, fmt.Errorf("insert metadata_model_defaults failed, err: %v", err)
		}
		successfulUpserts += 1
	}

	return successfulUpserts, nil
}
