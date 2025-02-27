package routers

import (
	"github.com/go-chi/chi/v5"

	intrepopostgres "github.com/icipe-official/Data-Abstraction-Platform/internal/interfaces/repository/postgres"
	intlib "github.com/icipe-official/Data-Abstraction-Platform/internal/lib"
)

func InitApiCoreRouter(router *chi.Mux, envMap *intlib.EnvVariables, postgresRepository *intrepopostgres.PostrgresRepository) {

}
