package abstractions

import (
	"github.com/go-chi/chi/v5"

	inthttp "github.com/icipe-official/Data-Abstraction-Platform/internal/interfaces/http"
)

func WebsiteRouter(webService *inthttp.WebService) *chi.Mux {
	router := chi.NewRouter()

	// acceptedHTMLPartialNames := []string{intdoment.WEBSITE_HTMLTMPL_PRTL_ROUTES, intdoment.WEBSITE_HTMLTMPL_PRTL_ROUTESGROUPID}

	// router.Get("/", func(w http.ResponseWriter, r *http.Request) {
	// 	ctx := context.WithValue(r.Context(), intlib.LOG_ATTR_CTX_KEY, slog.Attr{Key: intlib.LogSectionAttrKey, Value: slog.StringValue(intlib.LogSectionName(r.URL.Path, webService.Env))})
	// 	s := initWebsiteService(ctx, webService)
	// 	if s == nil {
	// 		intlib.SendJsonErrorResponse(intlib.NewError(http.StatusInternalServerError, http.StatusText(http.StatusInternalServerError)), w)
	// 		return
	// 	}

	// 	authedIamCredential, _ := intlib.IamHttpRequestCtxGetAuthedIamCredential(r)

	// 	authContextDirectoryGroupID := uuid.Nil
	// 	if authedIamCredential != nil {
	// 		if directoryGroup, err := s.ServiceDirectoryGroupsFindOneByIamCredentialID(ctx, authedIamCredential.ID[0]); err == nil {
	// 			if directoryGroup != nil {
	// 				authContextDirectoryGroupID = directoryGroup.ID[0]
	// 			}
	// 		}
	// 	}

	// 	isPartialRequest, partialName := intlib.WebsiteValidateHTMLPartialRequest(r, acceptedHTMLPartialNames)
	// 	if htmlContent, err := s.ServiceGetAbstractionsPageHtml(ctx, webService.WebsiteTemplate, webService.OpenID, isPartialRequest, partialName, authedIamCredential, authContextDirectoryGroupID, nil); err != nil {
	// 		intlib.SendJsonErrorResponse(err, w)
	// 	} else {
	// 		intlib.WebsiteSendHTMLResponse(htmlContent, w)
	// 	}
	// })

	return router
}

func ApiCoreRouter(webService *inthttp.WebService) *chi.Mux {
	router := chi.NewRouter()

	// router.Get("/metadata-model/{id}", func(w http.ResponseWriter, r *http.Request) {
	// 	ctx := context.WithValue(r.Context(), intlib.LOG_ATTR_CTX_KEY, slog.Attr{Key: intlib.LogSectionAttrKey, Value: slog.StringValue(intlib.LogSectionName(r.URL.Path, webService.Env))})

	// 	s := initApiCoreService(ctx, webService)
	// 	if s == nil {
	// 		intlib.SendJsonErrorResponse(intlib.NewError(http.StatusInternalServerError, http.StatusText(http.StatusInternalServerError)), w)
	// 		return
	// 	}

	// 	directoryGroupID, err := uuid.FromString(chi.URLParam(r, "id"))
	// 	if err != nil {
	// 		intlib.SendJsonErrorResponse(intlib.NewError(http.StatusBadRequest, http.StatusText(http.StatusBadRequest)), w)
	// 		return
	// 	}

	// 	metadataModel, err := s.ServiceAbstractionsMetadataModelGet(ctx, directoryGroupID)
	// 	if err != nil {
	// 		intlib.SendJsonErrorResponse(err, w)
	// 		return
	// 	}

	// 	intlib.SendJsonResponse(http.StatusOK, metadataModel, w)
	// 	webService.Logger.Log(ctx, slog.LevelInfo, fmt.Sprintf("metadata-model retrieved for %s", directoryGroupID), ctx.Value(intlib.LOG_ATTR_CTX_KEY))
	// })

	return router
}

// func initWebsiteService(ctx context.Context, webService *inthttp.WebService) intdomint.RouteAbstractionsWebsiteService {
// 	if value, err := NewService(webService); err != nil {
// 		errmsg := fmt.Errorf("initialize website service failed, error: %v", err)
// 		if value.logger != nil {
// 			value.logger.Log(ctx, slog.LevelError, errmsg.Error())
// 		} else {
// 			log.Println(errmsg)
// 		}

// 		return nil
// 	} else {
// 		return value
// 	}
// }

// func initApiCoreService(ctx context.Context, webService *inthttp.WebService) intdomint.RouteAbstractionsApiCoreService {
// 	if value, err := NewService(webService); err != nil {
// 		errmsg := fmt.Errorf("initialize api core service failed, error: %v", err)
// 		if value.logger != nil {
// 			value.logger.Log(ctx, slog.LevelError, errmsg.Error())
// 		} else {
// 			log.Println(errmsg)
// 		}

// 		return nil
// 	} else {
// 		return value
// 	}
// }
