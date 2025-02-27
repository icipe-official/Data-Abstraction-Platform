package home

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

const (
	redirect_PARAM_SESSION_STATE string = "session_state"
	redirect_PARAM_ISS           string = "iss"
	redirect_PARAM_CODE          string = "code"
)

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

func (n *service) ServiceGetHomePageHtml(ctx context.Context, websiteTemplate intdomint.WebsiteTemplates, openid intdomint.OpenID, partialRequest bool, partialName string) (*string, error) {
	websiteTemplate.WebsiteTemplateResetBaseTemplate()
	var data any

	if partialRequest {
		switch partialName {
		case intdoment.WEBSITE_HTMLTMPL_PRTL_ROUTES:
			if baseTemplate, err := websiteTemplate.WebsiteTemplateParseFile(ctx, intdoment.WEBSITE_HTMLTMPL_ROUTES_PAGE); err != nil {
				n.logger.Log(ctx, slog.LevelError, intlib.FunctionNameAndError(n.ServiceGetHomePageHtml, err).Error())
				return nil, intlib.NewError(http.StatusInternalServerError, "Parse template failed")
			} else {
				if err := websiteTemplate.WebsiteTemplateSetBaseTemplate(baseTemplate); err != nil {
					n.logger.Log(ctx, slog.LevelError, intlib.FunctionNameAndError(n.ServiceGetHomePageHtml, err).Error())
					return nil, intlib.NewError(http.StatusInternalServerError, "Parse template failed")
				}
			}
		default:
			return nil, intlib.NewError(http.StatusBadRequest, "Invalid inline section")
		}
	} else {
		if baseTemplate, routesData, err := intlib.WebsiteGetRoutesLayout(ctx, openid, websiteTemplate, nil); err != nil {
			n.logger.Log(ctx, slog.LevelError, intlib.FunctionNameAndError(n.ServiceGetHomePageHtml, err).Error())
			return nil, intlib.NewError(http.StatusInternalServerError, "Parse template failed")
		} else {
			if err := websiteTemplate.WebsiteTemplateSetBaseTemplate(baseTemplate); err != nil {
				n.logger.Log(ctx, slog.LevelError, intlib.FunctionNameAndError(n.ServiceGetHomePageHtml, err).Error())
				return nil, intlib.NewError(http.StatusInternalServerError, "Parse template failed")
			}
			data, err = intlibjson.SetValueInObject(data, fmt.Sprintf("%s.%s", intdoment.WEBSITE_PATH_ROUTES, intdoment.WEBSITE_PATH_KEY_DATA), routesData)
			if err != nil {
				n.logger.Log(ctx, slog.LevelError, intlib.FunctionNameAndError(n.ServiceGetHomePageHtml, err).Error())
				return nil, intlib.NewError(http.StatusInternalServerError, http.StatusText(http.StatusInternalServerError))
			}
		}

		if err := websiteTemplate.WebsiteTemplateRegisterPartialFile(ctx, intdoment.WEBSITE_HTMLTMPL_ROUTES_PAGE, intdoment.WEBSITE_HTMLTMPL_PRTL_ROUTES); err != nil {
			n.logger.Log(ctx, slog.LevelError, intlib.FunctionNameAndError(n.ServiceGetHomePageHtml, err).Error())
			return nil, intlib.NewError(http.StatusInternalServerError, "Parse template failed")
		}
	}

	if err := websiteTemplate.WebsiteTemplateRegisterPartialFile(ctx, intdoment.WEBSITE_HTMLTMPL_LIB_PAGES_ERROR, intdoment.WEBSITE_HTMLTMPL_PRTL_ERROR); err != nil {
		n.logger.Log(ctx, slog.LevelError, intlib.FunctionNameAndError(n.ServiceGetHomePageHtml, err).Error())
		return nil, intlib.NewError(http.StatusInternalServerError, "Parse template failed")
	}

	if htmlContent, err := websiteTemplate.WebstieTemplateGetHtmlContext(ctx, data); err != nil {
		n.logger.Log(ctx, slog.LevelError, intlib.FunctionNameAndError(n.ServiceGetHomePageHtml, err).Error())
		return nil, intlib.NewError(http.StatusInternalServerError, "Parse template failed")
	} else {
		return &htmlContent, nil
	}
}

func (n *service) ServiceGetIamCredentialsByOpenIDSub(ctx context.Context, openIDUserInfo *intdoment.OpenIDUserInfo) (*intdoment.IamCredentials, error) {
	iamCredentials, err := n.repo.RepoIamCredentialsFindOneByID(ctx, intdoment.IamCredentialsRepository().OpenidSub, openIDUserInfo.Sub, []string{intdoment.IamCredentialsRepository().ID, intdoment.IamCredentialsRepository().DeactivatedOn})
	if err != nil {
		n.logger.Log(ctx, slog.LevelError, intlib.FunctionNameAndError(n.ServiceGetIamCredentialsByOpenIDSub, err).Error())
		return nil, intlib.NewError(http.StatusInternalServerError, http.StatusText(http.StatusInternalServerError))
	}

	if iamCredentials != nil {
		if !iamCredentials.DeactivatedOn[0].IsZero() {
			return nil, intlib.NewError(http.StatusForbidden, http.StatusText(http.StatusForbidden))
		}
		return iamCredentials, nil
	}

	iamCredentials, err = n.repo.RepoIamCredentialsInsertOpenIDUserInfo(ctx, openIDUserInfo, []string{intdoment.IamCredentialsRepository().ID})
	if err != nil {
		n.logger.Log(ctx, slog.LevelError, intlib.FunctionNameAndError(n.ServiceGetIamCredentialsByOpenIDSub, err).Error())
		return nil, intlib.NewError(http.StatusInternalServerError, http.StatusText(http.StatusInternalServerError))
	}

	return iamCredentials, nil
}

func (n *service) ServiceOpenIDRevokeToken(ctx context.Context, openid intdomint.OpenID, token *intdoment.OpenIDToken) error {
	if err := openid.OpenIDRevokeToken(token); err != nil {
		n.logger.Log(ctx, slog.LevelError, fmt.Sprintf("revoke open id token failed, error: %v", err), intlib.FunctionName(n.ServiceGetOpenIDUserInfo))
		return intlib.NewError(http.StatusInternalServerError, http.StatusText(http.StatusInternalServerError))
	}
	return nil
}

func (n *service) ServiceGetOpenIDUserInfo(ctx context.Context, openid intdomint.OpenID, token *intdoment.OpenIDToken) (*intdoment.OpenIDUserInfo, error) {
	if userInfo, err := openid.OpenIDGetUserinfo(token); err != nil {
		n.logger.Log(ctx, slog.LevelError, fmt.Sprintf("get open id user info failed, error: %v", err), intlib.FunctionName(n.ServiceGetOpenIDUserInfo))
		return nil, intlib.NewError(http.StatusInternalServerError, http.StatusText(http.StatusInternalServerError))
	} else {
		return userInfo, nil
	}
}

func (n *service) ServiceGetOpenIDToken(ctx context.Context, openid intdomint.OpenID, redirectParams *intdoment.OpenIDRedirectParams) (*intdoment.OpenIDToken, error) {
	if token, err := openid.OpenIDGetTokenFromRedirect(redirectParams); err != nil {
		n.logger.Log(ctx, slog.LevelError, fmt.Sprintf("get open id token failed, error: %v", err), intlib.FunctionName(n.ServiceGetOpenIDToken))
		return nil, intlib.NewError(http.StatusInternalServerError, http.StatusText(http.StatusInternalServerError))
	} else {
		return token, nil
	}
}
