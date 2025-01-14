package metadatamodels

import (
	"context"
	"log/slog"
	"net/http"

	"github.com/go-chi/chi/v5"
	intpkglib "github.com/icipe-official/Data-Abstraction-Platform/internal/pkg/lib"
	intpkglog "github.com/icipe-official/Data-Abstraction-Platform/internal/pkg/log"
	intpkgutils "github.com/icipe-official/Data-Abstraction-Platform/internal/pkg/utils"
	intpkgwebsite "github.com/icipe-official/Data-Abstraction-Platform/internal/pkg/website"
)

func WebsiteRouter(webService *intpkglib.WebService, acceptedHTMLPartialNames []string) *chi.Mux {
	router := chi.NewRouter()

	router.Get("/{id}", func(w http.ResponseWriter, r *http.Request) {
		n := requestResponseContextData{
			WebService:                   webService,
			HTMLMetadataModelPageContext: new(HTMLMetadataModelPageContext),
			Context:                      context.WithValue(r.Context(), intpkglib.LOG_ATTR_CTX_KEY, slog.Attr{Key: intpkglog.SectionAttrKey, Value: slog.StringValue("home-page")}),
		}

		if isPartialRequest, partialName := intpkgwebsite.ValidateHTMLPartialRequest(r, acceptedHTMLPartialNames); isPartialRequest != "" && partialName != "" {
			n.HTMLIsPartialRequest = isPartialRequest
			n.HTMLPartialName = partialName
		}

		// Get logged in user info

		// Validate authorization and Get medatata model

		if err := n.GetMetadataModelPage(); err != nil {
			intpkgutils.SendJsonErrorResponse(err, w)
		} else {
			intpkgwebsite.SendHTMLResponse(&n.HTMLContent, w)
		}
	})

	return router
}
