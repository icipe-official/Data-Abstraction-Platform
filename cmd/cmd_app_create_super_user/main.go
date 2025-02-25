package main

import (
	"context"
	"log"

	intcmdappcreatesuperuser "github.com/icipe-official/Data-Abstraction-Platform/internal/interfaces/cmd_app_create_super_user"
	intrepopostgres "github.com/icipe-official/Data-Abstraction-Platform/internal/interfaces/repository/postgres"
	intliblog "github.com/icipe-official/Data-Abstraction-Platform/internal/lib/log"
)

func main() {
	ctx := context.TODO()

	logger := intliblog.NewHttpLogger()

	repository, err := intrepopostgres.NewPostgresRepository(ctx)
	if err != nil {
		log.Fatal("Failed to establish repository connection, error: ", err)
	}

	service := intcmdappcreatesuperuser.NewCmdCreateSuperUserService(repository)
	iamCredential, err := service.ServiceGetIamCredentials(ctx, logger)
	if err != nil {
		log.Fatal("get iam credential failed, error: ", err)
	}

	if err := service.ServiceAssignSystemRolesToIamCredential(ctx, logger, iamCredential); err != nil {
		log.Fatal("assign system roles to  iam credential failed, error: ", err)
	}

	log.Println("System roles successfully assigned to iam credential")
}
