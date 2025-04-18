package iam

import (
	"context"
	"fmt"
	"log"
	"log/slog"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"

	intdoment "github.com/icipe-official/Data-Abstraction-Platform/internal/domain/entities"
	intdomint "github.com/icipe-official/Data-Abstraction-Platform/internal/domain/interfaces"
	inthttp "github.com/icipe-official/Data-Abstraction-Platform/internal/interfaces/http"
	intlib "github.com/icipe-official/Data-Abstraction-Platform/internal/lib"
)

func ApiCoreRouter(webService *inthttp.WebService) *chi.Mux {
	router := chi.NewRouter()

	router.Get("/login", func(w http.ResponseWriter, r *http.Request) {
		ctx := context.WithValue(r.Context(), intlib.LOG_ATTR_CTX_KEY, slog.Attr{Key: intlib.LogSectionAttrKey, Value: slog.StringValue(intlib.LogSectionName(r.URL.Path, webService.Env))})

		s := initApiCoreService(ctx, webService)
		if s == nil {
			intlib.SendJsonErrorResponse(intlib.NewError(http.StatusInternalServerError, http.StatusText(http.StatusInternalServerError)), w)
			return
		}

		openIDToken := new(intdoment.OpenIDToken)
		openIDToken.AccessToken = r.Header.Get(intdoment.OPENID_HEADER_ACCESS_TOKEN)
		if value, err := strconv.Atoi(r.Header.Get(intdoment.OPENID_HEADER_ACCESS_TOKEN_EXPIRES_IN)); err != nil {
			intlib.SendJsonErrorResponse(intlib.NewError(http.StatusBadRequest, http.StatusText(http.StatusBadRequest)), w)
			return

		} else {
			openIDToken.ExpiresIn = int64(value)
		}
		openIDToken.RefreshToken = r.Header.Get(intdoment.OPENID_HEADER_REFRESH_TOKEN)
		if value, err := strconv.Atoi(r.Header.Get(intdoment.OPENID_HEADER_REFRESH_TOKEN_EXPIRES_IN)); err != nil {
			intlib.SendJsonErrorResponse(intlib.NewError(http.StatusBadRequest, http.StatusText(http.StatusBadRequest)), w)
			return
		} else {
			openIDToken.RefreshExpiresIn = int64(value)
		}

		openIDTokenIntrospect, err := s.ServiceOpenIDIntrospectToken(ctx, webService.OpenID, openIDToken)
		if err != nil {
			intlib.SendJsonErrorResponse(err, w)
			return
		}

		iamCredential, err := s.ServiceGetIamCredentialsByOpenIDSub(ctx, openIDTokenIntrospect)
		if err != nil {
			intlib.SendJsonErrorResponse(err, w)
			return
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
			intlib.SendJsonResponse(http.StatusOK, iamCredential, w)
			webService.Logger.Log(ctx, slog.LevelInfo+2, fmt.Sprintf("api login by %v", iamCredential.ID), ctx.Value(intlib.LOG_ATTR_CTX_KEY))
		}
	})

	router.Route("/", func(authedRoutes chi.Router) {
		authedRoutes.Use(intlib.IamAuthenticationMiddleware(webService.Logger, webService.Env, webService.OpenID, webService.IamCookie, webService.PostgresRepository))

		authedRoutes.Get("/logout", func(w http.ResponseWriter, r *http.Request) {
			ctx := context.WithValue(r.Context(), intlib.LOG_ATTR_CTX_KEY, slog.Attr{Key: intlib.LogSectionAttrKey, Value: slog.StringValue(intlib.LogSectionName(r.URL.Path, webService.Env))})

			authedIamCredential, err := intlib.IamHttpRequestCtxGetAuthedIamCredential(r)
			if err != nil {
				intlib.SendJsonErrorResponse(err, w)
				return
			}

			intlib.SendJsonResponse(http.StatusOK, authedIamCredential, w)
			webService.Logger.Log(ctx, slog.LevelInfo+2, fmt.Sprintf("api logout by %v", authedIamCredential.ID), ctx.Value(intlib.LOG_ATTR_CTX_KEY))
		})
	})

	return router
}

func initApiCoreService(ctx context.Context, webService *inthttp.WebService) intdomint.RouteIamService {
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
