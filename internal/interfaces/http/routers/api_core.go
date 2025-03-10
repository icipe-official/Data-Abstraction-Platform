package routers

import (
	"github.com/go-chi/chi/v5"

	inthttp "github.com/icipe-official/Data-Abstraction-Platform/internal/interfaces/http"
	"github.com/icipe-official/Data-Abstraction-Platform/internal/interfaces/http/routes/directory"
	directorygroups "github.com/icipe-official/Data-Abstraction-Platform/internal/interfaces/http/routes/directory/groups"
	ruleauthorizations "github.com/icipe-official/Data-Abstraction-Platform/internal/interfaces/http/routes/group/rule-authorizations"
	"github.com/icipe-official/Data-Abstraction-Platform/internal/interfaces/http/routes/iam"
	iamcredentials "github.com/icipe-official/Data-Abstraction-Platform/internal/interfaces/http/routes/iam/credentials"
	metadatamodel "github.com/icipe-official/Data-Abstraction-Platform/internal/interfaces/http/routes/metadata-model"
	metadatamodels "github.com/icipe-official/Data-Abstraction-Platform/internal/interfaces/http/routes/metadata-models"
	intlib "github.com/icipe-official/Data-Abstraction-Platform/internal/lib"
)

func InitApiCoreRouter(router *chi.Mux, webService *inthttp.WebService) {
	router.Route(webService.Env.Get(intlib.ENV_WEB_SERVICE_BASE_PATH)+"api", func(baseRouter chi.Router) {
		baseRouter.Route("/iam", func(iamRouter chi.Router) {
			iamRouter.Mount("/credentials", iamcredentials.ApiCoreRouter(webService))
			iamRouter.Mount("/", iam.ApiCoreRouter(webService))
		})

		baseRouter.Route("/", func(authedRouter chi.Router) {
			authedRouter.Use(intlib.IamAuthenticationMiddleware(webService.Logger, webService.Env, webService.OpenID, webService.IamCookie, webService.PostgresRepository))

			authedRouter.Route("/directory", func(directoryRouter chi.Router) {
				directoryRouter.Mount("/", directory.ApiCoreRouter(webService))
				directoryRouter.Mount("/groups", directorygroups.ApiCoreRouter(webService))
			})
			authedRouter.Mount("/metadata-model", metadatamodel.ApiCoreRouter(webService))
			authedRouter.Mount("/metadata-models", metadatamodels.ApiCoreRouter(webService))
			authedRouter.Route("/group", func(groupRouter chi.Router) {
				groupRouter.Mount("/rule-authorizations", ruleauthorizations.ApiCoreRouter(webService))
			})
		})
	})
}
