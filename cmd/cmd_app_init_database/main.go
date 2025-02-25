package main

import (
	"context"
	"log"

	intdoment "github.com/icipe-official/Data-Abstraction-Platform/internal/domain/entities"
	intcmdappinitdatabase "github.com/icipe-official/Data-Abstraction-Platform/internal/interfaces/cmd_app_init_database"
	intrepopostgres "github.com/icipe-official/Data-Abstraction-Platform/internal/interfaces/repository/postgres"

	intliblog "github.com/icipe-official/Data-Abstraction-Platform/internal/lib/log"
)

func main() {
	ctx := context.TODO()
	repository, err := intrepopostgres.NewPostgresRepository(ctx)
	if err != nil {
		log.Fatal("Failed to establish repository connection, error: ", err)
	}

	logger := intliblog.NewHttpLogger()

	service := intcmdappinitdatabase.NewCmdInitDatabaseService(repository)

	successfulUpserts, err := service.ServiceGroupAuthorizationRulesCreate(ctx, logger)
	if err != nil {
		log.Fatalf("Failed to insert %s, error: %v", intdoment.GroupAuthorizationRulesRepository().RepositoryName, err)
	}
	log.Printf("No of %s: %v", intdoment.GroupAuthorizationRulesRepository().RepositoryName, successfulUpserts)

	if err := service.ServiceInitSystemDirectoryGroup(ctx, logger); err != nil {
		log.Fatal("Initialize system directory group failed: ", err)
	}
	log.Println("System directory group initialization succeeded")

	successfulUpserts, err = service.ServiceMetadataModelDefaultsCreate(ctx, logger, intdoment.AllMetadataModelsDefaults())
	if err != nil {
		log.Fatalf("Failed to insert %s, error: %v", intdoment.MetadataModelsDefaultsRepository().RepositoryName, err)
	}
	log.Printf("No of %s: %v", intdoment.MetadataModelsDefaultsRepository().RepositoryName, successfulUpserts)

	successfulUpserts, err = service.ServiceStorageTypesCreate(ctx, logger)
	if err != nil {
		log.Fatalf("Failed to insert %s, error: %v", intdoment.StorageDrivesTypesRepository().RepositoryName, err)
	}
	log.Printf("No of %s: %v", intdoment.StorageDrivesTypesRepository().RepositoryName, successfulUpserts)
}
