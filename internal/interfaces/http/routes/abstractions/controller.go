package abstractions

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

func WebsiteRouter(webService *inthttp.WebService) *chi.Mux {
	router := chi.NewRouter()

	acceptedHTMLPartialNames := []string{intdoment.WEBSITE_HTMLTMPL_PRTL_ROUTES, intdoment.WEBSITE_HTMLTMPL_PRTL_ROUTESGROUPID}

	router.Get("/{id}", func(w http.ResponseWriter, r *http.Request) {
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

		var data any
		if datumID, err := uuid.FromString(chi.URLParam(r, "id")); err == nil && !datumID.IsNil() {
			mmSearch := new(intdoment.MetadataModelSearch)
			if value, err := s.ServiceAbstractionsGetMetadataModel(
				ctx,
				intmmretrieve.NewMetadataModelRetrieve(webService.Logger, webService.PostgresRepository, authContextDirectoryGroupID, authedIamCredential, nil),
				1,
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
					DatabaseFieldColumnName:    intdoment.AbstractionsRepository().ID,
					FilterCondition: [][]intdoment.MetadataModelFilterCondition{
						{
							{
								Negate:    false,
								Condition: intlibmmodel.FILTER_CONDTION_EQUAL_TO,
								Value: map[string]any{
									intlibmmodel.FIELD_SELECT_PROP_TYPE:  intlibmmodel.FIELD_SELECT_TYPE_TEXT,
									intlibmmodel.FIELD_SELECT_PROP_VALUE: datumID.String(),
								},
							},
						},
					},
				},
			}
			var mmSearchResults *intdoment.MetadataModelSearchResults
			if searchResults, err := s.ServiceAbstractionsSearch(
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

			if json, err := json.Marshal(mmDatum); err != nil {
				webService.Logger.Log(ctx, slog.LevelError, fmt.Sprintf("convert  mmDatum to json failed, error: %v", err), ctx.Value(intlib.LOG_ATTR_CTX_KEY))
				intlib.SendJsonErrorResponse(intlib.NewError(http.StatusInternalServerError, http.StatusText(http.StatusInternalServerError)), w)
				return
			} else {
				if value, err := intlibjson.SetValueInObject(data, fmt.Sprintf("%s.%s", intdoment.WEBSITE_PATH_ROUTES_GROUPID_METADATAMODELS, intdoment.WEBSITE_PATH_KEY_DATA), string(json)); err != nil {
					webService.Logger.Log(ctx, slog.LevelError, fmt.Sprintf("set directory group context data failed, error: %v", err), ctx.Value(intlib.LOG_ATTR_CTX_KEY))
					intlib.SendJsonErrorResponse(intlib.NewError(http.StatusInternalServerError, http.StatusText(http.StatusInternalServerError)), w)
					return
				} else {
					data = value
				}
			}
		}

		if htmlContent, err := s.ServiceGetAbstractionPageHtml(ctx, webService.WebsiteTemplate, webService.OpenID, isPartialRequest, partialName, authedIamCredential, authContextDirectoryGroupID, data); err != nil {
			intlib.SendJsonErrorResponse(err, w)
		} else {
			intlib.WebsiteSendHTMLResponse(htmlContent, w)
		}
	})

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
		if htmlContent, err := s.ServiceGetAbstractionsPageHtml(ctx, webService.WebsiteTemplate, webService.OpenID, isPartialRequest, partialName, authedIamCredential, authContextDirectoryGroupID, nil); err != nil {
			intlib.SendJsonErrorResponse(err, w)
		} else {
			intlib.WebsiteSendHTMLResponse(htmlContent, w)
		}
	})

	return router
}

func ApiCoreRouter(webService *inthttp.WebService) *chi.Mux {
	router := chi.NewRouter()

	router.Post("/delete", func(w http.ResponseWriter, r *http.Request) {
		ctx := context.WithValue(r.Context(), intlib.LOG_ATTR_CTX_KEY, slog.Attr{Key: intlib.LogSectionAttrKey, Value: slog.StringValue(intlib.LogSectionName(r.URL.Path, webService.Env))})

		authedIamCredential, err := intlib.IamHttpRequestCtxGetAuthedIamCredential(r)
		if err != nil {
			intlib.SendJsonErrorResponse(err, w)
			return
		}

		data := make([]*intdoment.Abstractions, 0)
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

		if code, verbres, err := s.ServiceAbstractionsDeleteMany(ctx, authedIamCredential, nil, authContextDirectoryGroupID, verboseResponse, data); err != nil {
			intlib.SendJsonErrorResponse(err, w)
			return
		} else {
			intlib.SendJsonResponse(code, verbres, w)
			webService.Logger.Log(
				ctx,
				slog.LevelInfo+1,
				intlib.LogAction(intlib.LOG_ACTION_DELETE, intdoment.AbstractionsRepository().RepositoryName),
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

		data := make([]*intdoment.Abstractions, 0)
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

		if code, verbres, err := s.ServiceAbstractionsUpdateMany(ctx, authedIamCredential, nil, authContextDirectoryGroupID, verboseResponse, data); err != nil {
			intlib.SendJsonErrorResponse(err, w)
			return
		} else {
			intlib.SendJsonResponse(code, verbres, w)
			webService.Logger.Log(
				ctx,
				slog.LevelInfo+1,
				intlib.LogAction(intlib.LOG_ACTION_UPDATE, intdoment.AbstractionsRepository().RepositoryName),
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

		data := make([]*intdoment.Abstractions, 0)
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
		doNotSkipIfAbstrationWithFileIDExists := intlib.UrlSearchParamGetBool(r, param_DO_NOT_SKIP_IF_ABSTRACTION_WITH_FILE_ID_EXISTS, false)

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

		if code, verbres, err := s.ServiceAbstractionsInsertMany(
			ctx,
			authedIamCredential,
			nil,
			authContextDirectoryGroupID,
			verboseResponse,
			data,
			doNotSkipIfAbstrationWithFileIDExists,
		); err != nil {
			intlib.SendJsonErrorResponse(err, w)
			return
		} else {
			intlib.SendJsonResponse(code, verbres, w)
			webService.Logger.Log(
				ctx,
				slog.LevelInfo+1,
				intlib.LogAction(intlib.LOG_ACTION_CREATE, intdoment.AbstractionsRepository().RepositoryName),
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

			authedIamCredential, _ := intlib.IamHttpRequestCtxGetAuthedIamCredential(r)

			mmSearch := new(intdoment.MetadataModelSearch)
			json.NewDecoder(r.Body).Decode(mmSearch)

			s := initApiCoreService(ctx, webService)
			if s == nil {
				intlib.SendJsonErrorResponse(intlib.NewError(http.StatusInternalServerError, http.StatusText(http.StatusInternalServerError)), w)
				return
			}

			var authContextDirectoryGroupID uuid.UUID
			if value, err := intlib.UrlSearchParamGetUuid(r, intlib.URL_SEARCH_PARAM_AUTH_CONTEXT_DIRECTORY_GROUP_ID); err != nil {
				if authedIamCredential != nil {
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
				}
			} else {
				authContextDirectoryGroupID = value
			}

			mmSearchModelWasEmpty := false
			if mmSearch.MetadataModel == nil {
				if value, err := s.ServiceAbstractionsGetMetadataModel(
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

			if searchResults, err := s.ServiceAbstractionsSearch(
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
						intdoment.AbstractionsRepository().RepositoryName,
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

			authedIamCredential, _ := intlib.IamHttpRequestCtxGetAuthedIamCredential(r)

			s := initApiCoreService(ctx, webService)
			if s == nil {
				intlib.SendJsonErrorResponse(intlib.NewError(http.StatusInternalServerError, http.StatusText(http.StatusInternalServerError)), w)
				return
			}

			var authContextDirectoryGroupID uuid.UUID
			if value, err := intlib.UrlSearchParamGetUuid(r, intlib.URL_SEARCH_PARAM_AUTH_CONTEXT_DIRECTORY_GROUP_ID); err != nil {
				if authedIamCredential != nil {
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

			if value, err := s.ServiceAbstractionsGetMetadataModel(
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
						intdoment.AbstractionsRepository().RepositoryName,
						"metadata-model successfully retrieved",
					),
					ctx.Value(intlib.LOG_ATTR_CTX_KEY),
					"authenicated iam credential",
					intlib.JsonStringifyMust(authedIamCredential),
				)
			}
		})
	})

	router.Get("/metadata-model/{id}", func(w http.ResponseWriter, r *http.Request) {
		ctx := context.WithValue(r.Context(), intlib.LOG_ATTR_CTX_KEY, slog.Attr{Key: intlib.LogSectionAttrKey, Value: slog.StringValue(intlib.LogSectionName(r.URL.Path, webService.Env))})

		s := initApiCoreService(ctx, webService)
		if s == nil {
			intlib.SendJsonErrorResponse(intlib.NewError(http.StatusInternalServerError, http.StatusText(http.StatusInternalServerError)), w)
			return
		}

		directoryGroupID, err := uuid.FromString(chi.URLParam(r, "id"))
		if err != nil {
			intlib.SendJsonErrorResponse(intlib.NewError(http.StatusBadRequest, http.StatusText(http.StatusBadRequest)), w)
			return
		}

		metadataModel, err := s.ServiceAbstractionsMetadataModelGet(ctx, directoryGroupID)
		if err != nil {
			intlib.SendJsonErrorResponse(err, w)
			return
		}

		intlib.SendJsonResponse(http.StatusOK, metadataModel, w)
		webService.Logger.Log(ctx, slog.LevelInfo, fmt.Sprintf("metadata-model retrieved for %s", directoryGroupID), ctx.Value(intlib.LOG_ATTR_CTX_KEY))
	})

	return router
}

func initWebsiteService(ctx context.Context, webService *inthttp.WebService) intdomint.RouteAbstractionsWebsiteService {
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

func initApiCoreService(ctx context.Context, webService *inthttp.WebService) intdomint.RouteAbstractionsApiCoreService {
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
