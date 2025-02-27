package routers

import (
	"net/http"

	"github.com/go-chi/chi/v5"

	inthttp "github.com/icipe-official/Data-Abstraction-Platform/internal/interfaces/http"
	"github.com/icipe-official/Data-Abstraction-Platform/internal/interfaces/http/routes/home"
	intlib "github.com/icipe-official/Data-Abstraction-Platform/internal/lib"

	intdoment "github.com/icipe-official/Data-Abstraction-Platform/internal/domain/entities"
	metadatamodels "github.com/icipe-official/Data-Abstraction-Platform/internal/interfaces/http/routes/metadata_models"
)

func InitWebServiceWebsiteRouter(router *chi.Mux, webService *inthttp.WebService) {
	router.Handle(webService.Env.Get(intlib.ENV_WEB_SERVICE_BASE_PATH)+"assets/*", http.StripPrefix(webService.Env.Get(intlib.ENV_WEB_SERVICE_BASE_PATH), http.FileServer(http.Dir(webService.Env.Get(intlib.ENV_WEBSITE_DIRECTORY)))))

	router.Mount(webService.Env.Get(intlib.ENV_WEB_SERVICE_BASE_PATH)+"redirect", home.RedirectRouter(webService))

	router.Route(webService.Env.Get(intlib.ENV_WEB_SERVICE_BASE_PATH), func(baseRouter chi.Router) {
		baseRouter.Use(intlib.IamAuthenticationMiddleware(webService.Logger, webService.Env, webService.OpenID))

		baseRouter.Mount("/", home.WebsiteRouter(webService, []string{intdoment.WEBSITE_HTMLTMPL_PRTL_ROUTES}))
		baseRouter.Mount("/metadata-models", metadatamodels.WebsiteRouter(webService, []string{intdoment.WEBSITE_HTMLTMPL_PRTL_ROUTES, intdoment.WEBSITE_HTMLTMPL_PRTL_ROUTESGROUPID}))
	})
}
