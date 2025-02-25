package main

import (
	"context"
	"log"

	intcmdappcreatesuperuser "github.com/icipe-official/Data-Abstraction-Platform/internal/interfaces/cmd_app_create_super_user"
	intrepopostgres "github.com/icipe-official/Data-Abstraction-Platform/internal/interfaces/repository/postgres"
)

func main() {
	ctx := context.TODO()

	repository, err := intrepopostgres.NewPostgresRepository(ctx)
	if err != nil {
		log.Fatal("Failed to establish repository connection, error: ", err)
	}

	service := intcmdappcreatesuperuser.NewCmdCreateSuperUserService(repository)

}
