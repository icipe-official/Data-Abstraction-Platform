package metadatamodels

import (
	"fmt"
	"log/slog"
	"net/http"

	"github.com/aymerick/raymond"
	intpkglib "github.com/icipe-official/Data-Abstraction-Platform/internal/pkg/lib"
	intpkgutils "github.com/icipe-official/Data-Abstraction-Platform/internal/pkg/utils"
	intpkgwebsite "github.com/icipe-official/Data-Abstraction-Platform/internal/pkg/website"
)

func (n *requestResponseContextData) GetMetadataModelPage() error {
	var template *raymond.Template
	var err error

	if n.HTMLIsPartialRequest == "true" {
		switch n.HTMLPartialName {
		case intpkgwebsite.HTMLTMPL_PRTL_ROUTES:
			template, err = intpkgwebsite.GetTemplate(n.Context, n.WebService, intpkgwebsite.HTMLTMPL_ROUTES_PAGE)
			if err != nil {
				return intpkgutils.NewError(http.StatusInternalServerError, "Parse template failed")
			}
			if err := intpkgwebsite.TemplateRegisterPartialFile(n.Context, n.WebService, template, intpkgwebsite.HTMLTMPL_ROUTES_GROUPID_METADATAMODELS_ID_PAGE, intpkgwebsite.HTMLTMPL_PRTL_ROUTESGROUPID); err != nil {
				return intpkgutils.NewError(http.StatusInternalServerError, "Parse template failed")
			}
		case intpkgwebsite.HTMLTMPL_PRTL_ROUTESGROUPID:
			template, err = intpkgwebsite.GetTemplate(n.Context, n.WebService, intpkgwebsite.HTMLTMPL_ROUTES_GROUPID_METADATAMODELS_ID_PAGE)
			if err != nil {
				return intpkgutils.NewError(http.StatusInternalServerError, "Parse template failed")
			}
		default:
			return intpkgutils.NewError(http.StatusInternalServerError, "Invalid inline section")
		}
	} else {
		template, n.HTMLMetadataModelPageContext.Data, err = intpkgwebsite.GetRoutesLayout(n.Context, n.WebService, nil)
		if err != nil {
			return intpkgutils.NewError(http.StatusInternalServerError, "Parse template failed")
		}

		if err := intpkgwebsite.TemplateRegisterPartialFile(n.Context, n.WebService, template, intpkgwebsite.HTMLTMPL_ROUTES_GROUPID_LAYOUT, intpkgwebsite.HTMLTMPL_PRTL_ROUTES); err != nil {
			return intpkgutils.NewError(http.StatusInternalServerError, "Parse template failed")
		}

		if err := intpkgwebsite.TemplateRegisterPartialFile(n.Context, n.WebService, template, intpkgwebsite.HTMLTMPL_ROUTES_GROUPID_METADATAMODELS_ID_PAGE, intpkgwebsite.HTMLTMPL_PRTL_ROUTESGROUPID); err != nil {
			return intpkgutils.NewError(http.StatusInternalServerError, "Parse template failed")
		}
	}

	if err = intpkgwebsite.TemplateRegisterPartialFile(n.Context, n.WebService, template, intpkgwebsite.HTMLTMPL_LIB_PAGES_ERROR, intpkgwebsite.HTMLTMPL_PRTL_ERROR); err != nil {
		return intpkgutils.NewError(http.StatusInternalServerError, "Parse template failed")
	}

	if n.HTMLContent, err = template.Exec(n.HTMLMetadataModelPageContext); err != nil {
		n.WebService.Logger.Log(n.Context, slog.LevelError, fmt.Sprintf("evaluate template failed, error: %v", err), n.Context.Value(intpkglib.LOG_ATTR_CTX_KEY))
		return intpkgutils.NewError(http.StatusInternalServerError, "Parse template failed")
	}

	return nil
}
