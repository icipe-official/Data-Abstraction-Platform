package metadatamodels

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
	"net/http"

	intdoment "github.com/icipe-official/Data-Abstraction-Platform/internal/domain/entities"
	intdomint "github.com/icipe-official/Data-Abstraction-Platform/internal/domain/interfaces"
	inthttp "github.com/icipe-official/Data-Abstraction-Platform/internal/interfaces/http"
	intlib "github.com/icipe-official/Data-Abstraction-Platform/internal/lib"
	intlibjson "github.com/icipe-official/Data-Abstraction-Platform/internal/lib/json"
)

type service struct {
	repo   intdomint.RouteHomeRepository
	logger intdomint.Logger
}

func NewService(webService *inthttp.WebService) (*service, error) {
	n := new(service)

	n.repo = webService.PostgresRepository
	n.logger = webService.Logger

	if n.logger == nil {
		return n, errors.New("webService.Logger is empty")
	}

	if n.repo == nil {
		return n, errors.New("webService.PostgresRepository is empty")
	}

	return n, nil
}

func (n *service) ServiceGetMedataModelPageHtml(ctx context.Context, websiteTemplate intdomint.WebsiteTemplates, openid intdomint.OpenID, partialRequest bool, partialName string) (*string, error) {
	websiteTemplate.WebsiteTemplateResetBaseTemplate()
	var data any

	if partialRequest {
		switch partialName {
		case intdoment.WEBSITE_HTMLTMPL_PRTL_ROUTES:
			if baseTemplate, err := websiteTemplate.WebsiteTemplateParseFile(ctx, intdoment.WEBSITE_HTMLTMPL_ROUTES_PAGE); err != nil {
				n.logger.Log(ctx, slog.LevelError, intlib.FunctionNameAndError(n.ServiceGetMedataModelPageHtml, err).Error())
				return nil, intlib.NewError(http.StatusInternalServerError, "Parse template failed")
			} else {
				if err := websiteTemplate.WebsiteTemplateSetBaseTemplate(baseTemplate); err != nil {
					n.logger.Log(ctx, slog.LevelError, intlib.FunctionNameAndError(n.ServiceGetMedataModelPageHtml, err).Error())
					return nil, intlib.NewError(http.StatusInternalServerError, "Parse template failed")
				}
			}

			if err := websiteTemplate.WebsiteTemplateRegisterPartialFile(ctx, intdoment.WEBSITE_HTMLTMPL_ROUTES_GROUPID_METADATAMODELS_ID_PAGE, intdoment.WEBSITE_HTMLTMPL_PRTL_ROUTESGROUPID); err != nil {
				n.logger.Log(ctx, slog.LevelError, intlib.FunctionNameAndError(n.ServiceGetMedataModelPageHtml, err).Error())
				return nil, intlib.NewError(http.StatusInternalServerError, "Parse template failed")
			}
		case intdoment.WEBSITE_HTMLTMPL_PRTL_ROUTESGROUPID:
			if baseTemplate, err := websiteTemplate.WebsiteTemplateParseFile(ctx, intdoment.WEBSITE_HTMLTMPL_ROUTES_GROUPID_METADATAMODELS_ID_PAGE); err != nil {
				n.logger.Log(ctx, slog.LevelError, intlib.FunctionNameAndError(n.ServiceGetMedataModelPageHtml, err).Error())
				return nil, intlib.NewError(http.StatusInternalServerError, "Parse template failed")
			} else {
				if err := websiteTemplate.WebsiteTemplateSetBaseTemplate(baseTemplate); err != nil {
					n.logger.Log(ctx, slog.LevelError, intlib.FunctionNameAndError(n.ServiceGetMedataModelPageHtml, err).Error())
					return nil, intlib.NewError(http.StatusInternalServerError, "Parse template failed")
				}
			}
		default:
			return nil, intlib.NewError(http.StatusBadRequest, "Invalid inline section")
		}
	} else {
		if baseTemplate, routesData, err := intlib.WebsiteGetRoutesLayout(ctx, openid, websiteTemplate, nil); err != nil {
			n.logger.Log(ctx, slog.LevelError, intlib.FunctionNameAndError(n.ServiceGetMedataModelPageHtml, err).Error())
			return nil, intlib.NewError(http.StatusInternalServerError, "Parse template failed")
		} else {
			if err := websiteTemplate.WebsiteTemplateSetBaseTemplate(baseTemplate); err != nil {
				n.logger.Log(ctx, slog.LevelError, intlib.FunctionNameAndError(n.ServiceGetMedataModelPageHtml, err).Error())
				return nil, intlib.NewError(http.StatusInternalServerError, "Parse template failed")
			}
			data, err = intlibjson.SetValueInObject(data, fmt.Sprintf("%s.%s", intdoment.WEBSITE_PATH_ROUTES, intdoment.WEBSITE_PATH_KEY_DATA), routesData)
			if err != nil {
				n.logger.Log(ctx, slog.LevelError, intlib.FunctionNameAndError(n.ServiceGetMedataModelPageHtml, err).Error())
				return nil, intlib.NewError(http.StatusInternalServerError, http.StatusText(http.StatusInternalServerError))
			}
		}

		if err := websiteTemplate.WebsiteTemplateRegisterPartialFile(ctx, intdoment.WEBSITE_HTMLTMPL_ROUTES_GROUPID_LAYOUT, intdoment.WEBSITE_HTMLTMPL_PRTL_ROUTES); err != nil {
			n.logger.Log(ctx, slog.LevelError, intlib.FunctionNameAndError(n.ServiceGetMedataModelPageHtml, err).Error())
			return nil, intlib.NewError(http.StatusInternalServerError, "Parse template failed")
		}

		if err := websiteTemplate.WebsiteTemplateRegisterPartialFile(ctx, intdoment.WEBSITE_HTMLTMPL_ROUTES_GROUPID_METADATAMODELS_ID_PAGE, intdoment.WEBSITE_HTMLTMPL_PRTL_ROUTESGROUPID); err != nil {
			n.logger.Log(ctx, slog.LevelError, intlib.FunctionNameAndError(n.ServiceGetMedataModelPageHtml, err).Error())
			return nil, intlib.NewError(http.StatusInternalServerError, "Parse template failed")
		}
	}

	if err := websiteTemplate.WebsiteTemplateRegisterPartialFile(ctx, intdoment.WEBSITE_HTMLTMPL_LIB_PAGES_ERROR, intdoment.WEBSITE_HTMLTMPL_PRTL_ERROR); err != nil {
		n.logger.Log(ctx, slog.LevelError, intlib.FunctionNameAndError(n.ServiceGetMedataModelPageHtml, err).Error())
		return nil, intlib.NewError(http.StatusInternalServerError, "Parse template failed")
	}

	if htmlContent, err := websiteTemplate.WebstieTemplateGetHtmlContext(ctx, data); err != nil {
		n.logger.Log(ctx, slog.LevelError, intlib.FunctionNameAndError(n.ServiceGetMedataModelPageHtml, err).Error())
		return nil, intlib.NewError(http.StatusInternalServerError, "Parse template failed")
	} else {
		return &htmlContent, nil
	}
}
