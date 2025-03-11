package authorizationrules

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
	"net/http"

	"github.com/gofrs/uuid/v5"
	intdoment "github.com/icipe-official/Data-Abstraction-Platform/internal/domain/entities"
	intdomint "github.com/icipe-official/Data-Abstraction-Platform/internal/domain/interfaces"
	inthttp "github.com/icipe-official/Data-Abstraction-Platform/internal/interfaces/http"
	intlib "github.com/icipe-official/Data-Abstraction-Platform/internal/lib"
	intlibjson "github.com/icipe-official/Data-Abstraction-Platform/internal/lib/json"
)

type service struct {
	repo   intdomint.RouteGroupAuthorizationRulesRepository
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

func (n *service) ServiceIamGroupAuthorizationsGetAuthorized(
	ctx context.Context,
	iamAuthInfo *intdoment.IamCredentials,
	authContextDirectoryGroupID uuid.UUID,
	groupAuthorizationRules []*intdoment.IamGroupAuthorizationRule,
	currentIamAuthorizationRules *intdoment.IamAuthorizationRules,
) ([]*intdoment.IamAuthorizationRule, error) {
	return n.repo.RepoIamGroupAuthorizationsGetAuthorized(
		ctx,
		iamAuthInfo,
		authContextDirectoryGroupID,
		groupAuthorizationRules,
		currentIamAuthorizationRules,
	)
}

func (n *service) ServiceGetGroupAuthorizationRulesPageHtml(
	ctx context.Context,
	websiteTemplate intdomint.WebsiteTemplates,
	openid intdomint.OpenID,
	partialRequest bool,
	partialName string,
	iamCredential *intdoment.IamCredentials,
	authContextDirectoryGroupID uuid.UUID,
	data any,
) (*string, error) {
	websiteTemplate.WebsiteTemplateResetBaseTemplate()

	if partialRequest {
		switch partialName {
		case intdoment.WEBSITE_HTMLTMPL_PRTL_ROUTES:
			if baseTemplate, err := websiteTemplate.WebsiteTemplateParseFile(ctx, intdoment.WEBSITE_HTMLTMPL_ROUTES_GROUPID_LAYOUT); err != nil {
				n.logger.Log(ctx, slog.LevelError, intlib.FunctionNameAndError(n.ServiceGetGroupAuthorizationRulesPageHtml, err).Error())
				return nil, intlib.NewError(http.StatusInternalServerError, "Parse template failed")
			} else {
				if err := websiteTemplate.WebsiteTemplateSetBaseTemplate(baseTemplate); err != nil {
					n.logger.Log(ctx, slog.LevelError, intlib.FunctionNameAndError(n.ServiceGetGroupAuthorizationRulesPageHtml, err).Error())
					return nil, intlib.NewError(http.StatusInternalServerError, "Parse template failed")
				}
			}

			if err := websiteTemplate.WebsiteTemplateRegisterPartialFile(ctx, intdoment.WEBSITE_HTMLTMPL_ROUTES_GROUPID_IAM_GROUP_AUTHORIZATION_RULES_PAGE, intdoment.WEBSITE_HTMLTMPL_PRTL_ROUTESGROUPID); err != nil {
				n.logger.Log(ctx, slog.LevelError, intlib.FunctionNameAndError(n.ServiceGetGroupAuthorizationRulesPageHtml, err).Error())
				return nil, intlib.NewError(http.StatusInternalServerError, "Parse template failed")
			}
		case intdoment.WEBSITE_HTMLTMPL_PRTL_ROUTESGROUPID:
			if baseTemplate, err := websiteTemplate.WebsiteTemplateParseFile(ctx, intdoment.WEBSITE_HTMLTMPL_ROUTES_GROUPID_IAM_GROUP_AUTHORIZATION_RULES_PAGE); err != nil {
				n.logger.Log(ctx, slog.LevelError, intlib.FunctionNameAndError(n.ServiceGetGroupAuthorizationRulesPageHtml, err).Error())
				return nil, intlib.NewError(http.StatusInternalServerError, "Parse template failed")
			} else {
				if err := websiteTemplate.WebsiteTemplateSetBaseTemplate(baseTemplate); err != nil {
					n.logger.Log(ctx, slog.LevelError, intlib.FunctionNameAndError(n.ServiceGetGroupAuthorizationRulesPageHtml, err).Error())
					return nil, intlib.NewError(http.StatusInternalServerError, "Parse template failed")
				}
			}
		default:
			return nil, intlib.NewError(http.StatusBadRequest, "Invalid inline section")
		}
	} else {
		if baseTemplate, routesData, err := intlib.WebsiteGetRoutesLayout(ctx, openid, websiteTemplate, iamCredential, authContextDirectoryGroupID); err != nil {
			n.logger.Log(ctx, slog.LevelError, intlib.FunctionNameAndError(n.ServiceGetGroupAuthorizationRulesPageHtml, err).Error())
			return nil, intlib.NewError(http.StatusInternalServerError, "Parse template failed")
		} else {
			if err := websiteTemplate.WebsiteTemplateSetBaseTemplate(baseTemplate); err != nil {
				n.logger.Log(ctx, slog.LevelError, intlib.FunctionNameAndError(n.ServiceGetGroupAuthorizationRulesPageHtml, err).Error())
				return nil, intlib.NewError(http.StatusInternalServerError, "Parse template failed")
			}
			data, err = intlibjson.SetValueInObject(data, fmt.Sprintf("%s.%s", intdoment.WEBSITE_PATH_ROUTES, intdoment.WEBSITE_PATH_KEY_DATA), routesData)
			if err != nil {
				n.logger.Log(ctx, slog.LevelError, intlib.FunctionNameAndError(n.ServiceGetGroupAuthorizationRulesPageHtml, err).Error())
				return nil, intlib.NewError(http.StatusInternalServerError, http.StatusText(http.StatusInternalServerError))
			}
		}

		if err := websiteTemplate.WebsiteTemplateRegisterPartialFile(ctx, intdoment.WEBSITE_HTMLTMPL_ROUTES_GROUPID_LAYOUT, intdoment.WEBSITE_HTMLTMPL_PRTL_ROUTES); err != nil {
			n.logger.Log(ctx, slog.LevelError, intlib.FunctionNameAndError(n.ServiceGetGroupAuthorizationRulesPageHtml, err).Error())
			return nil, intlib.NewError(http.StatusInternalServerError, "Parse template failed")
		}

		if err := websiteTemplate.WebsiteTemplateRegisterPartialFile(ctx, intdoment.WEBSITE_HTMLTMPL_ROUTES_GROUPID_IAM_GROUP_AUTHORIZATION_RULES_PAGE, intdoment.WEBSITE_HTMLTMPL_PRTL_ROUTESGROUPID); err != nil {
			n.logger.Log(ctx, slog.LevelError, intlib.FunctionNameAndError(n.ServiceGetGroupAuthorizationRulesPageHtml, err).Error())
			return nil, intlib.NewError(http.StatusInternalServerError, "Parse template failed")
		}
	}

	if err := websiteTemplate.WebsiteTemplateRegisterPartialFile(ctx, intdoment.WEBSITE_HTMLTMPL_LIB_PAGES_ERROR, intdoment.WEBSITE_HTMLTMPL_PRTL_ERROR); err != nil {
		n.logger.Log(ctx, slog.LevelError, intlib.FunctionNameAndError(n.ServiceGetGroupAuthorizationRulesPageHtml, err).Error())
		return nil, intlib.NewError(http.StatusInternalServerError, "Parse template failed")
	}

	if htmlContent, err := websiteTemplate.WebstieTemplateGetHtmlContext(ctx, data); err != nil {
		n.logger.Log(ctx, slog.LevelError, intlib.FunctionNameAndError(n.ServiceGetGroupAuthorizationRulesPageHtml, err).Error())
		return nil, intlib.NewError(http.StatusInternalServerError, "Parse template failed")
	} else {
		return &htmlContent, nil
	}
}

func (n *service) ServiceGroupAuthorizationRulesSearch(
	ctx context.Context,
	mmsearch *intdoment.MetadataModelSearch,
	repo intdomint.IamRepository,
	iamCredential *intdoment.IamCredentials,
	iamAuthorizationRules *intdoment.IamAuthorizationRules,
	startSearchDirectoryGroupID uuid.UUID,
	authContextDirectoryGroupID uuid.UUID,
	skipIfFGDisabled bool,
	skipIfDataExtraction bool,
	whereAfterJoin bool,
) (*intdoment.MetadataModelSearchResults, error) {
	if value, err := n.repo.RepoGroupAuthorizationRulesSearch(
		ctx,
		mmsearch,
		repo,
		iamCredential,
		iamAuthorizationRules,
		startSearchDirectoryGroupID,
		authContextDirectoryGroupID,
		skipIfFGDisabled,
		skipIfDataExtraction,
		whereAfterJoin,
	); err != nil {
		n.logger.Log(ctx, slog.LevelError, intlib.FunctionNameAndError(n.ServiceGroupAuthorizationRulesSearch, err).Error())
		return nil, intlib.NewError(http.StatusInternalServerError, http.StatusText(http.StatusInternalServerError))
	} else {
		return value, nil
	}
}

func (n *service) ServiceGroupAuthorizationRulesGetMetadataModel(ctx context.Context, metadataModelRetrieve intdomint.MetadataModelRetrieve, targetJoinDepth int) (map[string]any, error) {
	if value, err := metadataModelRetrieve.GroupAuthorizationRulesGetMetadataModel(ctx, 0, targetJoinDepth, nil); err != nil {
		n.logger.Log(ctx, slog.LevelWarn+1, intlib.FunctionNameAndError(n.ServiceGroupAuthorizationRulesGetMetadataModel, err).Error())
		return nil, intlib.NewError(http.StatusInternalServerError, http.StatusText(http.StatusInternalServerError))
	} else {
		return value, nil
	}
}

func (n *service) ServiceDirectoryGroupsFindOneByIamCredentialID(ctx context.Context, iamCredentialID uuid.UUID) (*intdoment.DirectoryGroups, error) {
	var directoryGroup *intdoment.DirectoryGroups
	if value, err := n.repo.RepoDirectoryGroupsFindOneByIamCredentialID(ctx, iamCredentialID, nil); err != nil {
		n.logger.Log(ctx, slog.LevelWarn+1, intlib.FunctionNameAndError(n.ServiceDirectoryGroupsFindOneByIamCredentialID, err).Error())
	} else {
		directoryGroup = value
	}

	if directoryGroup == nil {
		if dg, err := n.repo.RepoDirectoryGroupsFindSystemGroup(ctx, nil); err != nil {
			n.logger.Log(ctx, slog.LevelError, intlib.FunctionNameAndError(n.ServiceDirectoryGroupsFindOneByIamCredentialID, err).Error())
			return nil, intlib.NewError(http.StatusInternalServerError, http.StatusText(http.StatusInternalServerError))
		} else {
			directoryGroup = dg
		}
	}

	return directoryGroup, nil
}
