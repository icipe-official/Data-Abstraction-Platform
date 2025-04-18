package groups

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
)

func ApiCoreRouter(webService *inthttp.WebService) *chi.Mux {
	router := chi.NewRouter()

	router.Post("/delete", func(w http.ResponseWriter, r *http.Request) {
		ctx := context.WithValue(r.Context(), intlib.LOG_ATTR_CTX_KEY, slog.Attr{Key: intlib.LogSectionAttrKey, Value: slog.StringValue(intlib.LogSectionName(r.URL.Path, webService.Env))})

		authedIamCredential, err := intlib.IamHttpRequestCtxGetAuthedIamCredential(r)
		if err != nil {
			intlib.SendJsonErrorResponse(err, w)
			return
		}

		data := make([]*intdoment.MetadataModelsDirectoryGroups, 0)
		if err := json.NewDecoder(r.Body).Decode(&data); err != nil {
			intlib.SendJsonErrorResponse(intlib.NewError(http.StatusBadRequest, http.StatusText(http.StatusBadRequest)), w)
			return
		}

		s := initApiCoreService(ctx, webService)
		if s == nil {
			intlib.SendJsonErrorResponse(intlib.NewError(http.StatusInternalServerError, http.StatusText(http.StatusInternalServerError)), w)
			return
		}

		verboseResponse := intlib.UrlSearchParamGetBool(r, intlib.URL_SEARCH_PARAM_VERBOSE_RESPONSE, false)

		var authContextDirectoryGroupID uuid.UUID
		if value, err := intlib.UrlSearchParamGetUuid(r, intlib.URL_SEARCH_PARAM_AUTH_CONTEXT_DIRECTORY_GROUP_ID); err != nil {
			if directoryGroup, err := s.ServiceDirectoryGroupsFindOneByIamCredentialID(ctx, authedIamCredential.ID[0]); err != nil {
				intlib.SendJsonErrorResponse(intlib.NewError(http.StatusInternalServerError, http.StatusText(http.StatusInternalServerError)), w)
				return
			} else {
				if directoryGroup == nil {
					intlib.SendJsonErrorResponse(intlib.NewError(http.StatusInternalServerError, http.StatusText(http.StatusInternalServerError)), w)
					return
				}
				authContextDirectoryGroupID = directoryGroup.ID[0]
			}
		} else {
			authContextDirectoryGroupID = value
		}

		if iamAuthorizationRule, err := s.ServiceIamGroupAuthorizationsGetAuthorized(
			ctx,
			authedIamCredential,
			authContextDirectoryGroupID,
			[]*intdoment.IamGroupAuthorizationRule{
				{
					ID:        intdoment.AUTH_RULE_DELETE,
					RuleGroup: intdoment.AUTH_RULE_GROUP_METADATA_MODELS_DIRECTORY_GROUPS,
				},
			},
			nil,
		); err != nil || iamAuthorizationRule == nil {
			intlib.SendJsonErrorResponse(intlib.NewError(http.StatusForbidden, http.StatusText(http.StatusForbidden)), w)
			return
		}

		if code, verbres, err := s.ServiceMetadataModelsDirectoryGroupsDeleteMany(ctx, authedIamCredential, nil, authContextDirectoryGroupID, verboseResponse, data); err != nil {
			intlib.SendJsonErrorResponse(err, w)
			return
		} else {
			intlib.SendJsonResponse(code, verbres, w)
			webService.Logger.Log(
				ctx,
				slog.LevelInfo+1,
				intlib.LogAction(intlib.LOG_ACTION_DELETE, intdoment.MetadataModelsDirectoryGroupsRepository().RepositoryName),
				ctx.Value(intlib.LOG_ATTR_CTX_KEY),
				"authenicated iam credential",
				intlib.JsonStringifyMust(authedIamCredential),
				"verbose response data",
				intlib.JsonStringifyMust(verbres.MetadataModelVerboseResponse.Data),
			)
		}
	})

	router.Post("/update", func(w http.ResponseWriter, r *http.Request) {
		ctx := context.WithValue(r.Context(), intlib.LOG_ATTR_CTX_KEY, slog.Attr{Key: intlib.LogSectionAttrKey, Value: slog.StringValue(intlib.LogSectionName(r.URL.Path, webService.Env))})

		authedIamCredential, err := intlib.IamHttpRequestCtxGetAuthedIamCredential(r)
		if err != nil {
			intlib.SendJsonErrorResponse(err, w)
			return
		}

		data := make([]*intdoment.MetadataModelsDirectoryGroups, 0)
		if err := json.NewDecoder(r.Body).Decode(&data); err != nil {
			intlib.SendJsonErrorResponse(intlib.NewError(http.StatusBadRequest, http.StatusText(http.StatusBadRequest)), w)
			return
		}

		s := initApiCoreService(ctx, webService)
		if s == nil {
			intlib.SendJsonErrorResponse(intlib.NewError(http.StatusInternalServerError, http.StatusText(http.StatusInternalServerError)), w)
			return
		}

		verboseResponse := intlib.UrlSearchParamGetBool(r, intlib.URL_SEARCH_PARAM_VERBOSE_RESPONSE, false)

		var authContextDirectoryGroupID uuid.UUID
		if value, err := intlib.UrlSearchParamGetUuid(r, intlib.URL_SEARCH_PARAM_AUTH_CONTEXT_DIRECTORY_GROUP_ID); err != nil {
			if directoryGroup, err := s.ServiceDirectoryGroupsFindOneByIamCredentialID(ctx, authedIamCredential.ID[0]); err != nil {
				intlib.SendJsonErrorResponse(intlib.NewError(http.StatusInternalServerError, http.StatusText(http.StatusInternalServerError)), w)
				return
			} else {
				if directoryGroup == nil {
					intlib.SendJsonErrorResponse(intlib.NewError(http.StatusInternalServerError, http.StatusText(http.StatusInternalServerError)), w)
					return
				}
				authContextDirectoryGroupID = directoryGroup.ID[0]
			}
		} else {
			authContextDirectoryGroupID = value
		}

		if iamAuthorizationRule, err := s.ServiceIamGroupAuthorizationsGetAuthorized(
			ctx,
			authedIamCredential,
			authContextDirectoryGroupID,
			[]*intdoment.IamGroupAuthorizationRule{
				{
					ID:        intdoment.AUTH_RULE_UPDATE,
					RuleGroup: intdoment.AUTH_RULE_GROUP_METADATA_MODELS_DIRECTORY_GROUPS,
				},
			},
			nil,
		); err != nil || iamAuthorizationRule == nil {
			intlib.SendJsonErrorResponse(intlib.NewError(http.StatusForbidden, http.StatusText(http.StatusForbidden)), w)
			return
		}

		if code, verbres, err := s.ServiceMetadataModelsDirectoryGroupsUpdateMany(ctx, authedIamCredential, nil, authContextDirectoryGroupID, verboseResponse, data); err != nil {
			intlib.SendJsonErrorResponse(err, w)
			return
		} else {
			intlib.SendJsonResponse(code, verbres, w)
			webService.Logger.Log(
				ctx,
				slog.LevelInfo+1,
				intlib.LogAction(intlib.LOG_ACTION_UPDATE, intdoment.MetadataModelsDirectoryGroupsRepository().RepositoryName),
				ctx.Value(intlib.LOG_ATTR_CTX_KEY),
				"authenicated iam credential",
				intlib.JsonStringifyMust(authedIamCredential),
				"verbose response data",
				intlib.JsonStringifyMust(verbres.MetadataModelVerboseResponse.Data),
			)
		}
	})

	router.Post("/create", func(w http.ResponseWriter, r *http.Request) {
		ctx := context.WithValue(r.Context(), intlib.LOG_ATTR_CTX_KEY, slog.Attr{Key: intlib.LogSectionAttrKey, Value: slog.StringValue(intlib.LogSectionName(r.URL.Path, webService.Env))})

		authedIamCredential, err := intlib.IamHttpRequestCtxGetAuthedIamCredential(r)
		if err != nil {
			intlib.SendJsonErrorResponse(err, w)
			return
		}

		data := make([]*intdoment.MetadataModelsDirectoryGroups, 0)
		if err := json.NewDecoder(r.Body).Decode(&data); err != nil {
			intlib.SendJsonErrorResponse(intlib.NewError(http.StatusBadRequest, http.StatusText(http.StatusBadRequest)), w)
			return
		}

		s := initApiCoreService(ctx, webService)
		if s == nil {
			intlib.SendJsonErrorResponse(intlib.NewError(http.StatusInternalServerError, http.StatusText(http.StatusInternalServerError)), w)
			return
		}

		verboseResponse := intlib.UrlSearchParamGetBool(r, intlib.URL_SEARCH_PARAM_VERBOSE_RESPONSE, false)

		var authContextDirectoryGroupID uuid.UUID
		if value, err := intlib.UrlSearchParamGetUuid(r, intlib.URL_SEARCH_PARAM_AUTH_CONTEXT_DIRECTORY_GROUP_ID); err != nil {
			if directoryGroup, err := s.ServiceDirectoryGroupsFindOneByIamCredentialID(ctx, authedIamCredential.ID[0]); err != nil {
				intlib.SendJsonErrorResponse(intlib.NewError(http.StatusInternalServerError, http.StatusText(http.StatusInternalServerError)), w)
				return
			} else {
				if directoryGroup == nil {
					intlib.SendJsonErrorResponse(intlib.NewError(http.StatusInternalServerError, http.StatusText(http.StatusInternalServerError)), w)
					return
				}
				authContextDirectoryGroupID = directoryGroup.ID[0]
			}
		} else {
			authContextDirectoryGroupID = value
		}

		if iamAuthorizationRule, err := s.ServiceIamGroupAuthorizationsGetAuthorized(
			ctx,
			authedIamCredential,
			authContextDirectoryGroupID,
			[]*intdoment.IamGroupAuthorizationRule{
				{
					ID:        intdoment.AUTH_RULE_CREATE,
					RuleGroup: intdoment.AUTH_RULE_GROUP_METADATA_MODELS_DIRECTORY_GROUPS,
				},
			},
			nil,
		); err != nil || iamAuthorizationRule == nil {
			intlib.SendJsonErrorResponse(intlib.NewError(http.StatusForbidden, http.StatusText(http.StatusForbidden)), w)
			return
		}

		if code, verbres, err := s.ServiceMetadataModelsDirectoryGroupsInsertMany(ctx, authedIamCredential, nil, authContextDirectoryGroupID, verboseResponse, data); err != nil {
			intlib.SendJsonErrorResponse(err, w)
			return
		} else {
			intlib.SendJsonResponse(code, verbres, w)
			webService.Logger.Log(
				ctx,
				slog.LevelInfo+1,
				intlib.LogAction(intlib.LOG_ACTION_CREATE, intdoment.MetadataModelsDirectoryGroupsRepository().RepositoryName),
				ctx.Value(intlib.LOG_ATTR_CTX_KEY),
				"authenicated iam credential",
				intlib.JsonStringifyMust(authedIamCredential),
				"verbose response data",
				intlib.JsonStringifyMust(verbres.MetadataModelVerboseResponse.Data),
			)
		}
	})

	router.Route("/search", func(searchRouter chi.Router) {
		searchRouter.Post("/", func(w http.ResponseWriter, r *http.Request) {
			ctx := context.WithValue(r.Context(), intlib.LOG_ATTR_CTX_KEY, slog.Attr{Key: intlib.LogSectionAttrKey, Value: slog.StringValue(intlib.LogSectionName(r.URL.Path, webService.Env))})

			authedIamCredential, err := intlib.IamHttpRequestCtxGetAuthedIamCredential(r)
			if err != nil {
				intlib.SendJsonErrorResponse(err, w)
				return
			}

			mmSearch := new(intdoment.MetadataModelSearch)
			json.NewDecoder(r.Body).Decode(mmSearch)

			s := initApiCoreService(ctx, webService)
			if s == nil {
				intlib.SendJsonErrorResponse(intlib.NewError(http.StatusInternalServerError, http.StatusText(http.StatusInternalServerError)), w)
				return
			}

			var authContextDirectoryGroupID uuid.UUID
			if value, err := intlib.UrlSearchParamGetUuid(r, intlib.URL_SEARCH_PARAM_AUTH_CONTEXT_DIRECTORY_GROUP_ID); err != nil {
				if directoryGroup, err := s.ServiceDirectoryGroupsFindOneByIamCredentialID(ctx, authedIamCredential.ID[0]); err != nil {
					intlib.SendJsonErrorResponse(intlib.NewError(http.StatusInternalServerError, http.StatusText(http.StatusInternalServerError)), w)
					return
				} else {
					if directoryGroup == nil {
						intlib.SendJsonErrorResponse(intlib.NewError(http.StatusInternalServerError, http.StatusText(http.StatusInternalServerError)), w)
						return
					}
					authContextDirectoryGroupID = directoryGroup.ID[0]
				}
			} else {
				authContextDirectoryGroupID = value
			}

			mmSearchModelWasEmpty := false
			if mmSearch.MetadataModel == nil {
				if value, err := s.ServiceMetadataModelsDirectoryGroupsGetMetadataModel(
					ctx,
					intmmretrieve.NewMetadataModelRetrieve(webService.Logger, webService.PostgresRepository, authContextDirectoryGroupID, authedIamCredential, nil),
					1,
				); err != nil {
					intlib.SendJsonErrorResponse(err, w)
					return
				} else {
					mmSearch.MetadataModel = value
					mmSearchModelWasEmpty = true
				}
			}

			var startSearchDirectoryGroupID uuid.UUID
			if value, err := intlib.UrlSearchParamGetUuid(r, intlib.URL_SEARCH_PARAM_START_SEARCH_DIRECTORY_GROUP_ID); err == nil {
				startSearchDirectoryGroupID = value
			} else {
				startSearchDirectoryGroupID = authContextDirectoryGroupID
			}

			skipIfDataExtraction := intlib.UrlSearchParamGetBool(r, intlib.URL_SEARCH_PARAM_SKIP_IF_DATA_EXTRACTION, true)
			skipIfFGDisabled := intlib.UrlSearchParamGetBool(r, intlib.URL_SEARCH_PARAM_SKIP_IF_FG_DISABLED, true)
			whereAfterJoin := intlib.UrlSearchParamGetBool(r, intlib.URL_SEARCH_PARAM_WHERE_AFTER_JOIN, false)

			if searchResults, err := s.ServiceMetadataModelsDirectoryGroupsSearch(
				ctx,
				mmSearch,
				webService.PostgresRepository,
				authedIamCredential,
				nil,
				startSearchDirectoryGroupID,
				authContextDirectoryGroupID,
				skipIfFGDisabled,
				skipIfDataExtraction,
				whereAfterJoin,
			); err != nil {
				intlib.SendJsonErrorResponse(err, w)
				return
			} else {
				if !mmSearchModelWasEmpty {
					searchResults.MetadataModel = nil
				}
				intlib.SendJsonResponse(http.StatusOK, searchResults, w)
				webService.Logger.Log(
					ctx,
					slog.LevelInfo+1,
					fmt.Sprintln(
						intdoment.MetadataModelsDirectoryGroupsRepository().RepositoryName,
						"searched successfully",
					),
					ctx.Value(intlib.LOG_ATTR_CTX_KEY),
					"authenicated iam credential",
					intlib.JsonStringifyMust(authedIamCredential),
				)
			}
		})

		searchRouter.Get("/metadata-model", func(w http.ResponseWriter, r *http.Request) {
			ctx := context.WithValue(r.Context(), intlib.LOG_ATTR_CTX_KEY, slog.Attr{Key: intlib.LogSectionAttrKey, Value: slog.StringValue(intlib.LogSectionName(r.URL.Path, webService.Env))})

			authedIamCredential, err := intlib.IamHttpRequestCtxGetAuthedIamCredential(r)
			if err != nil {
				intlib.SendJsonErrorResponse(err, w)
				return
			}

			s := initApiCoreService(ctx, webService)
			if s == nil {
				intlib.SendJsonErrorResponse(intlib.NewError(http.StatusInternalServerError, http.StatusText(http.StatusInternalServerError)), w)
				return
			}

			var authContextDirectoryGroupID uuid.UUID
			if value, err := intlib.UrlSearchParamGetUuid(r, intlib.URL_SEARCH_PARAM_AUTH_CONTEXT_DIRECTORY_GROUP_ID); err != nil {
				if directoryGroup, err := s.ServiceDirectoryGroupsFindOneByIamCredentialID(ctx, authedIamCredential.ID[0]); err != nil {
					intlib.SendJsonErrorResponse(intlib.NewError(http.StatusInternalServerError, http.StatusText(http.StatusInternalServerError)), w)
					return
				} else {
					if directoryGroup == nil {
						intlib.SendJsonErrorResponse(intlib.NewError(http.StatusInternalServerError, http.StatusText(http.StatusInternalServerError)), w)
						return
					}
					authContextDirectoryGroupID = directoryGroup.ID[0]
				}
			} else {
				authContextDirectoryGroupID = value
			}

			targetJoinDepth := 1
			if value, err := intlib.UrlSearchParamGetInt(r, intlib.URL_SEARCH_PARAM_TARGET_JOIN_DEPTH); err == nil {
				targetJoinDepth = value
			} else {
				targetJoinDepth = 1
			}

			if value, err := s.ServiceMetadataModelsDirectoryGroupsGetMetadataModel(
				ctx,
				intmmretrieve.NewMetadataModelRetrieve(webService.Logger, webService.PostgresRepository, authContextDirectoryGroupID, authedIamCredential, nil),
				targetJoinDepth,
			); err != nil {
				intlib.SendJsonErrorResponse(err, w)
				return
			} else {
				intlib.SendJsonResponse(http.StatusOK, value, w)
				webService.Logger.Log(
					ctx,
					slog.LevelInfo+1,
					fmt.Sprintln(
						intdoment.MetadataModelsDirectoryGroupsRepository().RepositoryName,
						"metadata-model successfully retrieved",
					),
					ctx.Value(intlib.LOG_ATTR_CTX_KEY),
					"authenicated iam credential",
					intlib.JsonStringifyMust(authedIamCredential),
				)
			}
		})
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

		isPartialRequest, partialName := intlib.WebsiteValidateHTMLPartialRequest(r, acceptedHTMLPartialNames)
		var data any

		authedIamCredential, err := intlib.IamHttpRequestCtxGetAuthedIamCredential(r)
		if err != nil {
			if d, err := intdoment.WebsiteAddErrorToHTMLTemplateContext(data, isPartialRequest, partialName, http.StatusUnauthorized, http.StatusText(http.StatusUnauthorized)); err != nil {
				intlib.SendJsonErrorResponse(intlib.NewError(http.StatusUnauthorized, http.StatusText(http.StatusUnauthorized)), w)
				return
			} else {
				data = d
			}
		}

		authContextDirectoryGroupID := uuid.Nil
		if value, err := intlib.UrlSearchParamGetUuid(r, intlib.URL_SEARCH_PARAM_DIRECTORY_GROUP_ID); err != nil || value.IsNil() {
			if authedIamCredential != nil {
				if directoryGroup, err := s.ServiceDirectoryGroupsFindOneByIamCredentialID(ctx, authedIamCredential.ID[0]); err == nil {
					if directoryGroup != nil {
						authContextDirectoryGroupID = directoryGroup.ID[0]
					}
				}
			}
		} else {
			authContextDirectoryGroupID = value
		}

		if iamAuthorizationRule, err := s.ServiceIamGroupAuthorizationsGetAuthorized(
			ctx,
			authedIamCredential,
			authContextDirectoryGroupID,
			[]*intdoment.IamGroupAuthorizationRule{
				{
					ID:        "",
					RuleGroup: intdoment.AUTH_RULE_GROUP_METADATA_MODELS_DIRECTORY_GROUPS,
				},
			},
			nil,
		); err != nil || iamAuthorizationRule == nil {
			if d, err := intdoment.WebsiteAddErrorToHTMLTemplateContext(data, isPartialRequest, partialName, http.StatusForbidden, http.StatusText(http.StatusForbidden)); err != nil {
				intlib.SendJsonErrorResponse(intlib.NewError(http.StatusForbidden, http.StatusText(http.StatusForbidden)), w)
				return
			} else {
				data = d
			}
		}

		if htmlContent, err := s.ServiceGetMetadataModelsDirectoryGroupsPageHtml(ctx, webService.WebsiteTemplate, webService.OpenID, isPartialRequest, partialName, authedIamCredential, authContextDirectoryGroupID, data); err != nil {
			intlib.SendJsonErrorResponse(err, w)
		} else {
			intlib.WebsiteSendHTMLResponse(htmlContent, w)
		}
	})

	return router
}

func initWebsiteService(ctx context.Context, webService *inthttp.WebService) intdomint.RouteMetadataModelsDirectoryGroupsWebsiteService {
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

func initApiCoreService(ctx context.Context, webService *inthttp.WebService) intdomint.RouteMetadataModelsDirectoryGroupsApiService {
	if value, err := NewService(webService); err != nil {
		errmsg := fmt.Errorf("initialize api core service failed, error: %v", err)
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
