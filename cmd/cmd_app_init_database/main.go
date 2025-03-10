package main

import (
	"context"
	"log"

	intdoment "github.com/icipe-official/Data-Abstraction-Platform/internal/domain/entities"
	intcmdappinitdatabase "github.com/icipe-official/Data-Abstraction-Platform/internal/interfaces/cmd_app_init_database"
	intrepopostgres "github.com/icipe-official/Data-Abstraction-Platform/internal/interfaces/repository/postgres"
	intlib "github.com/icipe-official/Data-Abstraction-Platform/internal/lib"
)

func main() {
	ctx := context.TODO()
	logger := intlib.LogNewHttpLogger()

	repository, err := intrepopostgres.NewPostgresRepository(ctx, logger)
	if err != nil {
		log.Fatal("ERROR: Failed to establish repository connection, error: ", err)
	}

	service := intcmdappinitdatabase.NewCmdInitDatabaseService(repository, logger)

	successfulUpserts, err := service.ServiceGroupAuthorizationRulesCreate(ctx)
	if err != nil {
		log.Fatalf("ERROR: Failed to insert %s, error: %v", intdoment.GroupAuthorizationRulesRepository().RepositoryName, err)
	}
	log.Printf("SUCCESS: No of %s upserted: %v", intdoment.GroupAuthorizationRulesRepository().RepositoryName, successfulUpserts)

	if err := service.ServiceInitSystemDirectoryGroup(ctx); err != nil {
		log.Fatal("ERROR: Initialize system directory group failed: ", err)
	}
	log.Println("System directory group initialization succeeded")

	successfulUpserts, err = service.ServiceStorageTypesCreate(ctx)
	if err != nil {
		log.Fatalf("ERROR: Failed to insert %s, error: %v", intdoment.StorageDrivesTypesRepository().RepositoryName, err)
	}
	log.Printf("SUCCESS: No of %s upserted: %v", intdoment.StorageDrivesTypesRepository().RepositoryName, successfulUpserts)
}
