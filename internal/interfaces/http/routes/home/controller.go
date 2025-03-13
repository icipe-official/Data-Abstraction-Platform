package home

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"log/slog"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/gofrs/uuid/v5"

	intdoment "github.com/icipe-official/Data-Abstraction-Platform/internal/domain/entities"
	intdomint "github.com/icipe-official/Data-Abstraction-Platform/internal/domain/interfaces"
	inthttp "github.com/icipe-official/Data-Abstraction-Platform/internal/interfaces/http"
	intmmretrieve "github.com/icipe-official/Data-Abstraction-Platform/internal/interfaces/metadata_model_retrieve"
	intlib "github.com/icipe-official/Data-Abstraction-Platform/internal/lib"
	intlibjson "github.com/icipe-official/Data-Abstraction-Platform/internal/lib/json"
	intlibmmodel "github.com/icipe-official/Data-Abstraction-Platform/internal/lib/metadata_model"
)

func RedirectRouter(webService *inthttp.WebService) *chi.Mux {
	router := chi.NewRouter()

	router.Get("/login", func(w http.ResponseWriter, r *http.Request) {
		ctx := context.WithValue(r.Context(), intlib.LOG_ATTR_CTX_KEY, slog.Attr{Key: intlib.LogSectionAttrKey, Value: slog.StringValue(intlib.LogSectionName(r.URL.Path, webService.Env))})

		s := initWebsiteService(ctx, webService)
		if s == nil {
			intlib.SendJsonErrorResponse(intlib.NewError(http.StatusInternalServerError, http.StatusText(http.StatusInternalServerError)), w)
			return
		}

		openIDRedirectParams := new(intdoment.OpenIDRedirectParams)
		if param := r.URL.Query().Get(redirect_PARAM_SESSION_STATE); len(param) == 0 {
			intlib.SendJsonErrorResponse(intlib.NewError(http.StatusBadRequest, http.StatusText(http.StatusBadRequest)), w)
			return
		} else {
			openIDRedirectParams.SessionState = param
		}
		if param := r.URL.Query().Get(redirect_PARAM_ISS); len(param) == 0 {
			intlib.SendJsonErrorResponse(intlib.NewError(http.StatusBadRequest, http.StatusText(http.StatusBadRequest)), w)
			return
		} else {
			openIDRedirectParams.Iss = param
		}
		if param := r.URL.Query().Get(redirect_PARAM_CODE); len(param) == 0 {
			intlib.SendJsonErrorResponse(intlib.NewError(http.StatusBadRequest, http.StatusText(http.StatusBadRequest)), w)
			return
		} else {
			openIDRedirectParams.Code = param
		}

		openIDToken, err := s.ServiceGetOpenIDToken(ctx, webService.OpenID, openIDRedirectParams)
		if err != nil {
			intlib.SendJsonErrorResponse(err, w)
			return
		}

		openIDUserInfo, err := s.ServiceGetOpenIDUserInfo(ctx, webService.OpenID, openIDToken)
		if err != nil {
			intlib.SendJsonErrorResponse(err, w)
			return
		}

		iamCredential, err := s.ServiceGetIamCredentialsByOpenIDSub(ctx, openIDUserInfo)
		if err != nil {
			if err := s.ServiceOpenIDRevokeToken(ctx, webService.OpenID, openIDToken); err != nil {
				intlib.SendJsonErrorResponse(err, w)
				return
			}
			intlib.SendJsonErrorResponse(intlib.NewError(http.StatusInternalServerError, http.StatusText(http.StatusInternalServerError)), w)
		}

		if token, err := intlib.IamPrepOpenIDTokenForClient(webService.Env, openIDToken); err != nil {
			webService.Logger.Log(ctx, slog.LevelError, fmt.Sprintf("Prepare access refresh token for client failed, error: %v", err), ctx.Value(intlib.LOG_ATTR_CTX_KEY))
			if err := s.ServiceOpenIDRevokeToken(ctx, webService.OpenID, openIDToken); err != nil {
				intlib.SendJsonErrorResponse(err, w)
				return
			}
			intlib.SendJsonErrorResponse(intlib.NewError(http.StatusInternalServerError, http.StatusText(http.StatusInternalServerError)), w)
		} else {
			intlib.IamSetCookieInResponse(w, webService.IamCookie, token, int(openIDToken.ExpiresIn), int(openIDToken.RefreshExpiresIn))
			http.Redirect(w, r, webService.Env.Get(intlib.ENV_WEB_SERVICE_BASE_PATH), http.StatusSeeOther)
			webService.Logger.Log(ctx, slog.LevelInfo+2, fmt.Sprintf("login by %v", iamCredential.ID), ctx.Value(intlib.LOG_ATTR_CTX_KEY))
		}
	})

	return router
}

func WebsiteRouter(webService *inthttp.WebService) *chi.Mux {
	router := chi.NewRouter()

	acceptedHTMLPartialNames := []string{intdoment.WEBSITE_HTMLTMPL_PRTL_ROUTES, intdoment.WEBSITE_HTMLTMPL_PRTL_ROUTESGROUPID}

	router.Get("/", func(w http.ResponseWriter, r *http.Request) {
		ctx := context.WithValue(r.Context(), intlib.LOG_ATTR_CTX_KEY, slog.Attr{Key: intlib.LogSectionAttrKey, Value: slog.StringValue(intlib.LogSectionName(r.URL.Path, webService.Env))})
		s := initWebsiteService(ctx, webService)
		if s == nil {
			intlib.SendJsonErrorResponse(intlib.NewError(http.StatusInternalServerError, http.StatusText(http.StatusInternalServerError)), w)
			return
		}

		authedIamCredential, _ := intlib.IamHttpRequestCtxGetAuthedIamCredential(r)

		authContextDirectoryGroupID := uuid.Nil
		if authedIamCredential != nil {
			if directoryGroup, err := s.ServiceDirectoryGroupsFindOneByIamCredentialID(ctx, authedIamCredential.ID[0]); err == nil {
				if directoryGroup != nil {
					authContextDirectoryGroupID = directoryGroup.ID[0]
				}
			}
		}

		isPartialRequest, partialName := intlib.WebsiteValidateHTMLPartialRequest(r, acceptedHTMLPartialNames)

		if directoryGroupID, err := intlib.UrlSearchParamGetUuid(r, intlib.URL_SEARCH_PARAM_DIRECTORY_GROUP_ID); err == nil {
			mmSearch := new(intdoment.MetadataModelSearch)
			if value, err := s.ServiceDirectoryGroupsGetMetadataModel(
				ctx,
				intmmretrieve.NewMetadataModelRetrieve(webService.Logger, webService.PostgresRepository, authContextDirectoryGroupID, authedIamCredential, nil),
				-1,
			); err != nil {
				intlib.SendJsonErrorResponse(err, w)
				return
			} else {
				mmSearch.MetadataModel = value
			}
			tableCollectionUid := ""
			if value, ok := mmSearch.MetadataModel[intlibmmodel.QUERY_CONDITION_PROP_D_TABLE_COLLECTION_UID].(string); ok {
				tableCollectionUid = value
			} else {
				webService.Logger.Log(ctx, slog.LevelError, fmt.Sprintf("fetched metadata-model %s is empty", intlibmmodel.QUERY_CONDITION_PROP_D_TABLE_COLLECTION_UID), ctx.Value(intlib.LOG_ATTR_CTX_KEY))
				intlib.SendJsonErrorResponse(intlib.NewError(http.StatusInternalServerError, http.StatusText(http.StatusInternalServerError)), w)
				return
			}
			mmSearch.QueryConditions = make([]intdoment.MetadataModelQueryConditions, 1)
			mmSearch.QueryConditions[0] = intdoment.MetadataModelQueryConditions{
				"$.id": intdoment.MetadataModelQueryCondition{
					DatabaseTableCollectionUid: tableCollectionUid,
					DatabaseFieldColumnName:    intdoment.DirectoryGroupsRepository().ID,
					FilterCondition: [][]intdoment.MetadataModelFilterCondition{
						{
							{
								Negate:    false,
								Condition: intlibmmodel.FILTER_CONDTION_EQUAL_TO,
								Value: map[string]any{
									intlibmmodel.FIELD_SELECT_PROP_TYPE:  intlibmmodel.FIELD_SELECT_TYPE_TEXT,
									intlibmmodel.FIELD_SELECT_PROP_VALUE: directoryGroupID.String(),
								},
							},
						},
					},
				},
			}
			var mmSearchResults *intdoment.MetadataModelSearchResults
			if searchResults, err := s.ServiceDirectoryGroupsSearch(
				ctx,
				mmSearch,
				webService.PostgresRepository,
				authedIamCredential,
				nil,
				authContextDirectoryGroupID,
				authContextDirectoryGroupID,
				true,
				true,
				false,
			); err != nil {
				intlib.SendJsonErrorResponse(err, w)
				return
			} else {
				mmSearchResults = searchResults
			}

			if len(mmSearchResults.Data) != 1 {
				intlib.SendJsonErrorResponse(intlib.NewError(http.StatusNotFound, http.StatusText(http.StatusNotFound)), w)
				return
			}

			mmDatum := new(intdoment.MetadataModelDatum)
			mmDatum.MetadataModel = mmSearch.MetadataModel
			mmDatum.Datum = mmSearchResults.Data[0]

			var data any
			if json, err := json.Marshal(mmDatum); err != nil {
				webService.Logger.Log(ctx, slog.LevelError, fmt.Sprintf("convert  mmDatum to json failed, error: %v", err), ctx.Value(intlib.LOG_ATTR_CTX_KEY))
				intlib.SendJsonErrorResponse(intlib.NewError(http.StatusInternalServerError, http.StatusText(http.StatusInternalServerError)), w)
				return
			} else {
				if value, err := intlibjson.SetValueInObject(data, fmt.Sprintf("%s.%s", intdoment.WEBSITE_PATH_ROUTES_GROUPID_HOME, intdoment.WEBSITE_PATH_KEY_DATA), string(json)); err != nil {
					webService.Logger.Log(ctx, slog.LevelError, fmt.Sprintf("set directory group context data failed, error: %v", err), ctx.Value(intlib.LOG_ATTR_CTX_KEY))
					intlib.SendJsonErrorResponse(intlib.NewError(http.StatusInternalServerError, http.StatusText(http.StatusInternalServerError)), w)
					return
				} else {
					data = value
				}
			}

			if htmlContent, err := s.ServiceGetDirectoryGroupHomePageHmtl(ctx, webService.WebsiteTemplate, webService.OpenID, isPartialRequest, partialName, authedIamCredential, authContextDirectoryGroupID, data); err != nil {
				intlib.SendJsonErrorResponse(err, w)
			} else {
				intlib.WebsiteSendHTMLResponse(htmlContent, w)
			}
			return
		}

		if htmlContent, err := s.ServiceGetHomePageHtml(ctx, webService.WebsiteTemplate, webService.OpenID, isPartialRequest, partialName, authedIamCredential, authContextDirectoryGroupID, nil); err != nil {
			intlib.SendJsonErrorResponse(err, w)
		} else {
			intlib.WebsiteSendHTMLResponse(htmlContent, w)
		}
	})

	return router
}

func initWebsiteService(ctx context.Context, webService *inthttp.WebService) intdomint.RouteHomeWebsiteService {
	if value, err := NewService(webService); err != nil {
		errmsg := fmt.Errorf("initialize website service failed, error: %v", err)
		if value.logger != nil {
			value.logger.Log(ctx, slog.LevelError, errmsg.Error())
		} else {
			log.Println(errmsg)
		}

		return nil
	} else {
		return value
	}
}
