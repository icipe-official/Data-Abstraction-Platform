package home

import (
	"context"
	"fmt"
	"log/slog"
	"net/http"

	"github.com/go-chi/chi/v5"
	intpkgiam "github.com/icipe-official/Data-Abstraction-Platform/internal/pkg/iam"
	intpkgiamopenid "github.com/icipe-official/Data-Abstraction-Platform/internal/pkg/iam/open_id"
	intpkglib "github.com/icipe-official/Data-Abstraction-Platform/internal/pkg/lib"
	intpkglog "github.com/icipe-official/Data-Abstraction-Platform/internal/pkg/log"
	intpkgutils "github.com/icipe-official/Data-Abstraction-Platform/internal/pkg/utils"
	intpkgwebsite "github.com/icipe-official/Data-Abstraction-Platform/internal/pkg/website"
)

func RedirectRouter(webService *intpkglib.WebService, acceptedHTMLPartialNames []string) *chi.Mux {
	router := chi.NewRouter()

	router.Get("/login", func(w http.ResponseWriter, r *http.Request) {
		n := requestResponseContextData{
			WebService:          webService,
			RedirectData:        new(intpkgiamopenid.RedirectParams),
			HTMLHomePageContext: new(intpkgwebsite.RoutesContext),
			Context:             context.WithValue(r.Context(), intpkglib.LOG_ATTR_CTX_KEY, slog.Attr{Key: intpkglog.SectionAttrKey, Value: slog.StringValue("home-page")}),
		}

		if param := r.URL.Query().Get(redirect_PARAM_SESSION_STATE); len(param) == 0 {
			intpkgutils.SendJsonErrorResponse(intpkgutils.NewError(http.StatusBadRequest, http.StatusText(http.StatusBadRequest)), w)
			return
		} else {
			n.RedirectData.SessionState = param
		}

		if param := r.URL.Query().Get(redirect_PARAM_ISS); len(param) == 0 {
			intpkgutils.SendJsonErrorResponse(intpkgutils.NewError(http.StatusBadRequest, http.StatusText(http.StatusBadRequest)), w)
			return
		} else {
			n.RedirectData.Iss = param
		}

		if param := r.URL.Query().Get(redirect_PARAM_CODE); len(param) == 0 {
			intpkgutils.SendJsonErrorResponse(intpkgutils.NewError(http.StatusBadRequest, http.StatusText(http.StatusBadRequest)), w)
			return
		} else {
			n.RedirectData.Code = param
		}

		if err := n.GetOpenidTokenAndUserInfoAndIamCredentialID(); err != nil {
			intpkgutils.SendJsonErrorResponse(err, w)
			return
		}

		if token, err := intpkgiam.MinifyAccessRefreshToken(n.WebService, n.OpenidToken); err != nil {
			n.WebService.Logger.Log(n.Context, slog.LevelError, fmt.Sprintf("Minify access refresh token failed, error: %v", err), n.Context.Value(intpkglib.LOG_ATTR_CTX_KEY))
			if err := intpkgiam.OpenIDRevokeToken(n.WebService, n.OpenidToken); err != nil {
				n.WebService.Logger.Log(n.Context, slog.LevelError, fmt.Sprintf("Revoke openid token failed, error: %v", err), n.Context.Value(intpkglib.LOG_ATTR_CTX_KEY))
			}
			intpkgutils.SendJsonErrorResponse(intpkgutils.NewError(http.StatusInternalServerError, http.StatusText(http.StatusInternalServerError)), w)
		} else {
			http.SetCookie(w, intpkgiam.GetTokenCookie(webService, token, int(n.OpenidToken.RefreshExpiresIn)))
			http.Redirect(w, r, webService.Env[intpkglib.ENV_WEB_SERVICE_BASE_PATH], http.StatusSeeOther)
			n.WebService.Logger.Log(n.Context, slog.LevelInfo+2, fmt.Sprintf("login by %v", n.IamCredential.ID), n.Context.Value(intpkglib.LOG_ATTR_CTX_KEY))
		}
	})

	return router
}

func WebsiteRouter(webService *intpkglib.WebService, acceptedHTMLPartialNames []string) *chi.Mux {
	router := chi.NewRouter()

	router.Get("/", func(w http.ResponseWriter, r *http.Request) {
		n := requestResponseContextData{
			WebService:          webService,
			HTMLHomePageContext: new(intpkgwebsite.RoutesContext),
			Context:             context.WithValue(r.Context(), intpkglib.LOG_ATTR_CTX_KEY, slog.Attr{Key: intpkglog.SectionAttrKey, Value: slog.StringValue("home-page")}),
		}

		if isPartialRequest, partialName := intpkgwebsite.ValidateHTMLPartialRequest(r, acceptedHTMLPartialNames); isPartialRequest != "" && partialName != "" {
			n.HTMLIsPartialRequest = isPartialRequest
			n.HTMLPartialName = partialName
		}

		// Get logged in user info

		if err := n.GetHomePage(); err != nil {
			intpkgutils.SendJsonErrorResponse(err, w)
		} else {
			intpkgwebsite.SendHTMLResponse(&n.HTMLContent, w)
		}
	})

	return router
}
