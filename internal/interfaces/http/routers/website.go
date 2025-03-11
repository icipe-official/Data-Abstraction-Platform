package routers

import (
	"net/http"

	"github.com/go-chi/chi/v5"

	inthttp "github.com/icipe-official/Data-Abstraction-Platform/internal/interfaces/http"
	directorygroups "github.com/icipe-official/Data-Abstraction-Platform/internal/interfaces/http/routes/directory/groups"
	authorizationrules "github.com/icipe-official/Data-Abstraction-Platform/internal/interfaces/http/routes/group/authorization-rules"
	ruleauthorizations "github.com/icipe-official/Data-Abstraction-Platform/internal/interfaces/http/routes/group/rule-authorizations"
	"github.com/icipe-official/Data-Abstraction-Platform/internal/interfaces/http/routes/home"
	intlib "github.com/icipe-official/Data-Abstraction-Platform/internal/lib"

	metadatamodels "github.com/icipe-official/Data-Abstraction-Platform/internal/interfaces/http/routes/metadata-models"
)

func InitWebServiceWebsiteRouter(router *chi.Mux, webService *inthttp.WebService) {
	router.Handle(webService.Env.Get(intlib.ENV_WEB_SERVICE_BASE_PATH)+"assets/*", http.StripPrefix(webService.Env.Get(intlib.ENV_WEB_SERVICE_BASE_PATH), http.FileServer(http.Dir(webService.Env.Get(intlib.ENV_WEBSITE_DIRECTORY)))))

	router.Mount(webService.Env.Get(intlib.ENV_WEB_SERVICE_BASE_PATH)+"redirect", home.RedirectRouter(webService))

	router.Route(webService.Env.Get(intlib.ENV_WEB_SERVICE_BASE_PATH), func(baseRouter chi.Router) {
		baseRouter.Use(intlib.IamAuthenticationMiddleware(webService.Logger, webService.Env, webService.OpenID, webService.IamCookie, webService.PostgresRepository))

		baseRouter.Mount("/", home.WebsiteRouter(webService))
		baseRouter.Mount("/metadata-models", metadatamodels.WebsiteRouter(webService))
		baseRouter.Route("/directory", func(directoryRouter chi.Router) {
			directoryRouter.Mount("/groups", directorygroups.WebsiteRouter(webService))
		})
		baseRouter.Route("/group", func(groupRouter chi.Router) {
			groupRouter.Mount("/rule-authorizations", ruleauthorizations.WebsiteRouter(webService))
			groupRouter.Mount("/authorization-rules", authorizationrules.WebsiteRouter(webService))
		})
	})
}
