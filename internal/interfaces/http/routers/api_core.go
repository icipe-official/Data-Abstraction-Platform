package routers

import (
	"github.com/go-chi/chi/v5"

	inthttp "github.com/icipe-official/Data-Abstraction-Platform/internal/interfaces/http"
	directorygroups "github.com/icipe-official/Data-Abstraction-Platform/internal/interfaces/http/routes/directory_groups"
	"github.com/icipe-official/Data-Abstraction-Platform/internal/interfaces/http/routes/iam"
	intlib "github.com/icipe-official/Data-Abstraction-Platform/internal/lib"
)

func InitApiCoreRouter(router *chi.Mux, webService *inthttp.WebService) {
	router.Route(webService.Env.Get(intlib.ENV_WEB_SERVICE_BASE_PATH)+"api", func(baseRouter chi.Router) {
		baseRouter.Mount("/iam", iam.ApiCoreRouter(webService))

		baseRouter.Route("/", func(authedRouter chi.Router) {
			authedRouter.Use(intlib.IamAuthenticationMiddleware(webService.Logger, webService.Env, webService.OpenID, webService.IamCookie, webService.PostgresRepository))

			authedRouter.Mount("/directory-groups", directorygroups.ApiCoreRouter(webService))
		})
	})
}
