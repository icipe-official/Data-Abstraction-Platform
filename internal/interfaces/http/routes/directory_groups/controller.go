package directorygroups

import (
	"context"
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

	router.Route("/search", func(searchRouter chi.Router) {
		searchRouter.Post("/", func(w http.ResponseWriter, r *http.Request) {})

		searchRouter.Get("/metadata-model", func(w http.ResponseWriter, r *http.Request) {
			ctx := context.WithValue(r.Context(), intlib.LOG_ATTR_CTX_KEY, slog.Attr{Key: intlib.LogSectionAttrKey, Value: slog.StringValue("iam")})

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

			if value, err := s.ServiceGetDirectoryGroupsMetadataModel(
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
						intdoment.DirectoryGroupsRepository().RepositoryName,
						"metadata-model retrieved by",
						intlib.JsonStringifyMust(authedIamCredential),
					),
					ctx.Value(intlib.LOG_ATTR_CTX_KEY),
				)
			}
		})
	})

	return router
}

func initApiCoreService(ctx context.Context, webService *inthttp.WebService) intdomint.RouteDirectoryGroupsApiCoreService {
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
