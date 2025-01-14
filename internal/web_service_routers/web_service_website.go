package webservicerouters

import (
	"net/http"

	"github.com/go-chi/chi/v5"

	intpkgiam "github.com/icipe-official/Data-Abstraction-Platform/internal/pkg/iam"
	intpkglib "github.com/icipe-official/Data-Abstraction-Platform/internal/pkg/lib"
	intpkgwebsite "github.com/icipe-official/Data-Abstraction-Platform/internal/pkg/website"
	"github.com/icipe-official/Data-Abstraction-Platform/internal/web_service_routes/home"
	metadatamodels "github.com/icipe-official/Data-Abstraction-Platform/internal/web_service_routes/metadata_models"
)

func InitWebServiceWebsiteRouter(router *chi.Mux, webService *intpkglib.WebService) {
	router.Handle(webService.Env[intpkglib.ENV_WEB_SERVICE_BASE_PATH]+"assets/*", http.StripPrefix(webService.Env[intpkglib.ENV_WEB_SERVICE_BASE_PATH], http.FileServer(http.Dir(webService.Env[intpkglib.ENV_WEBSITE_DIRECTORY]))))

	router.Mount(webService.Env[intpkglib.ENV_WEB_SERVICE_BASE_PATH]+"redirect", home.RedirectRouter(webService, []string{intpkgwebsite.HTMLTMPL_PRTL_ROUTES}))

	router.Route(webService.Env[intpkglib.ENV_WEB_SERVICE_BASE_PATH], func(baseRouter chi.Router) {
		baseRouter.Use(intpkgiam.AuthenticationMiddleware(webService))

		baseRouter.Mount("/", home.WebsiteRouter(webService, []string{intpkgwebsite.HTMLTMPL_PRTL_ROUTES}))
		baseRouter.Mount("/metadata-models", metadatamodels.WebsiteRouter(webService, []string{intpkgwebsite.HTMLTMPL_PRTL_ROUTES, intpkgwebsite.HTMLTMPL_PRTL_ROUTESGROUPID}))
	})
}
