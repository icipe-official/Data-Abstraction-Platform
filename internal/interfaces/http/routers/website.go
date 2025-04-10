package routers

import (
	"net/http"

	"github.com/go-chi/chi/v5"

	inthttp "github.com/icipe-official/Data-Abstraction-Platform/internal/interfaces/http"
	"github.com/icipe-official/Data-Abstraction-Platform/internal/interfaces/http/routes/abstractions"
	abstractionsdirectorygroups "github.com/icipe-official/Data-Abstraction-Platform/internal/interfaces/http/routes/abstractions/directory-groups"
	"github.com/icipe-official/Data-Abstraction-Platform/internal/interfaces/http/routes/directory"
	directorygroups "github.com/icipe-official/Data-Abstraction-Platform/internal/interfaces/http/routes/directory/groups"
	authorizationrules "github.com/icipe-official/Data-Abstraction-Platform/internal/interfaces/http/routes/group/authorization-rules"
	ruleauthorizations "github.com/icipe-official/Data-Abstraction-Platform/internal/interfaces/http/routes/group/rule-authorizations"
	"github.com/icipe-official/Data-Abstraction-Platform/internal/interfaces/http/routes/home"
	"github.com/icipe-official/Data-Abstraction-Platform/internal/interfaces/http/routes/iam/credentials"
	groupauthorizations "github.com/icipe-official/Data-Abstraction-Platform/internal/interfaces/http/routes/iam/group-authorizations"
	metadatamodel "github.com/icipe-official/Data-Abstraction-Platform/internal/interfaces/http/routes/metadata-model"
	metadatamodelsdirectory "github.com/icipe-official/Data-Abstraction-Platform/internal/interfaces/http/routes/metadata-models/directory"
	metadatamodelsdirectorygroups "github.com/icipe-official/Data-Abstraction-Platform/internal/interfaces/http/routes/metadata-models/directory/groups"
	storagedrives "github.com/icipe-official/Data-Abstraction-Platform/internal/interfaces/http/routes/storage/drives"
	storagedrivesgroups "github.com/icipe-official/Data-Abstraction-Platform/internal/interfaces/http/routes/storage/drives/groups"
	storagefiles "github.com/icipe-official/Data-Abstraction-Platform/internal/interfaces/http/routes/storage/files"
	intlib "github.com/icipe-official/Data-Abstraction-Platform/internal/lib"

	metadatamodels "github.com/icipe-official/Data-Abstraction-Platform/internal/interfaces/http/routes/metadata-models"
)

func InitWebServiceWebsiteRouter(router *chi.Mux, webService *inthttp.WebService) {
	router.Handle(webService.Env.Get(intlib.ENV_WEB_SERVICE_BASE_PATH)+"assets/*", http.StripPrefix(webService.Env.Get(intlib.ENV_WEB_SERVICE_BASE_PATH), http.FileServer(http.Dir(webService.Env.Get(intlib.ENV_WEBSITE_DIRECTORY)))))

	router.Mount(webService.Env.Get(intlib.ENV_WEB_SERVICE_BASE_PATH)+"redirect", home.RedirectRouter(webService))

	router.Route(webService.Env.Get(intlib.ENV_WEB_SERVICE_BASE_PATH), func(baseRouter chi.Router) {
		baseRouter.Use(intlib.IamAuthenticationMiddleware(webService.Logger, webService.Env, webService.OpenID, webService.IamCookie, webService.PostgresRepository))

		baseRouter.Mount("/", home.WebsiteRouter(webService))
		baseRouter.Mount("/metadata-model", metadatamodel.ApiCoreRouter(webService))
		baseRouter.Route("/metadata-models", func(metadataModelsRouter chi.Router) {
			metadataModelsRouter.Route("/directory", func(directoryRouter chi.Router) {
				directoryRouter.Mount("/groups", metadatamodelsdirectorygroups.WebsiteRouter(webService))
				directoryRouter.Mount("/", metadatamodelsdirectory.WebsiteRouter(webService))
			})
			metadataModelsRouter.Mount("/", metadatamodels.WebsiteRouter(webService))
		})
		baseRouter.Route("/directory", func(directoryRouter chi.Router) {
			directoryRouter.Mount("/groups", directorygroups.WebsiteRouter(webService))
			directoryRouter.Mount("/", directory.WebsiteRouter(webService))
		})
		baseRouter.Route("/group", func(groupRouter chi.Router) {
			groupRouter.Mount("/rule-authorizations", ruleauthorizations.WebsiteRouter(webService))
			groupRouter.Mount("/authorization-rules", authorizationrules.WebsiteRouter(webService))
		})
		baseRouter.Route("/iam", func(iamRouter chi.Router) {
			iamRouter.Mount("/credentials", credentials.WebsiteRouter(webService))
			iamRouter.Mount("/group-authorizations", groupauthorizations.WebsiteRouter(webService))
		})
		baseRouter.Route("/storage", func(storageRouter chi.Router) {
			storageRouter.Route("/drives", func(drivesRouter chi.Router) {
				drivesRouter.Mount("/groups", storagedrivesgroups.WebsiteRouter(webService))
				drivesRouter.Mount("/", storagedrives.WebsiteRouter(webService))
			})
			storageRouter.Mount("/files", storagefiles.WebsiteRouter(webService))
		})
		baseRouter.Route("/abstractions", func(abstractionsRouter chi.Router) {
			abstractionsRouter.Mount("/directory-groups", abstractionsdirectorygroups.WebsiteRouter(webService))
			abstractionsRouter.Mount("/", abstractions.WebsiteRouter(webService))
		})
	})
}
