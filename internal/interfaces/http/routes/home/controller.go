package home

import (
	"context"
	"fmt"
	"log"
	"log/slog"
	"net/http"

	"github.com/go-chi/chi/v5"

	intdoment "github.com/icipe-official/Data-Abstraction-Platform/internal/domain/entities"
	intdomint "github.com/icipe-official/Data-Abstraction-Platform/internal/domain/interfaces"
	inthttp "github.com/icipe-official/Data-Abstraction-Platform/internal/interfaces/http"
	intlib "github.com/icipe-official/Data-Abstraction-Platform/internal/lib"
)

func RedirectRouter(webService *inthttp.WebService) *chi.Mux {
	router := chi.NewRouter()

	router.Get("/login", func(w http.ResponseWriter, r *http.Request) {
		ctx := context.WithValue(r.Context(), intlib.LOG_ATTR_CTX_KEY, slog.Attr{Key: intlib.LogSectionAttrKey, Value: slog.StringValue("home-page")})

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

		if token, err := intlib.IamMinifyOpenIDToken(webService.Env, openIDToken); err != nil {
			webService.Logger.Log(ctx, slog.LevelError, fmt.Sprintf("Minify access refresh token failed, error: %v", err), ctx.Value(intlib.LOG_ATTR_CTX_KEY))
			if err := s.ServiceOpenIDRevokeToken(ctx, webService.OpenID, openIDToken); err != nil {
				intlib.SendJsonErrorResponse(err, w)
				return
			}
			intlib.SendJsonErrorResponse(intlib.NewError(http.StatusInternalServerError, http.StatusText(http.StatusInternalServerError)), w)
		} else {
			http.SetCookie(w, intlib.GetTokenCookie(webService.IamCookie, token, int(openIDToken.ExpiresIn)))
			http.Redirect(w, r, webService.Env.Get(intlib.ENV_WEB_SERVICE_BASE_PATH), http.StatusSeeOther)
			webService.Logger.Log(ctx, slog.LevelInfo+2, fmt.Sprintf("login by %v", iamCredential.ID), ctx.Value(intlib.LOG_ATTR_CTX_KEY))
		}
	})

	return router
}

func WebsiteRouter(webService *inthttp.WebService, acceptedHTMLPartialNames []string) *chi.Mux {
	router := chi.NewRouter()

	router.Get("/", func(w http.ResponseWriter, r *http.Request) {
		ctx := context.WithValue(r.Context(), intlib.LOG_ATTR_CTX_KEY, slog.Attr{Key: intlib.LogSectionAttrKey, Value: slog.StringValue("home-page")})
		s := initWebsiteService(ctx, webService)
		if s == nil {
			intlib.SendJsonErrorResponse(intlib.NewError(http.StatusInternalServerError, http.StatusText(http.StatusInternalServerError)), w)
			return
		}

		isPartialRequest, partialName := intlib.WebsiteValidateHTMLPartialRequest(r, acceptedHTMLPartialNames)
		if htmlContent, err := s.ServiceGetHomePageHtml(ctx, webService.WebsiteTemplate, webService.OpenID, isPartialRequest, partialName); err != nil {
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
