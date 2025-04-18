package abstractions

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

func (n *service) ServiceAbstractionsDeleteMany(
	ctx context.Context,
	iamCredential *intdoment.IamCredentials,
	iamAuthorizationRules *intdoment.IamAuthorizationRules,
	authContextDirectoryGroupID uuid.UUID,
	verboseResponse bool,
	data []*intdoment.Abstractions,
) (int, *intdoment.MetadataModelVerbRes, error) {
	verbres := new(intdoment.MetadataModelVerbRes)
	verbres.MetadataModelVerboseResponse = new(intdoment.MetadataModelVerboseResponse)
	if verboseResponse {
		if d, err := intlib.MetadataModelMiscGet(intlib.METADATA_MODELS_MISC_VERBOSE_RESPONSE); err != nil {
			n.logger.Log(ctx, slog.LevelError, intlib.FunctionNameAndError(n.ServiceAbstractionsDeleteMany, err).Error())
			return 0, nil, intlib.NewError(http.StatusInternalServerError, fmt.Sprintf("Get %v metadata-model failed", intlib.METADATA_MODELS_MISC_VERBOSE_RESPONSE))
		} else {
			verbres.MetadataModelVerboseResponse.MetadataModel = d
		}
	}
	verbres.MetadataModelVerboseResponse.Data = make([]*intdoment.MetadataModelVerboseResponseData, 0)

	successful := 0
	failed := 0
	for _, datum := range data {
		verbRes := new(intdoment.MetadataModelVerboseResponseData)

		if len(datum.ID) > 0 {
			mm, iamAuthorizationRule, err := n.repo.RepoAbstractionsFindOneForDeletionByID(ctx, iamCredential, iamAuthorizationRules, authContextDirectoryGroupID, datum, nil)
			if err != nil {
				n.logger.Log(ctx, slog.LevelError, intlib.FunctionNameAndError(n.ServiceAbstractionsDeleteMany, err).Error())
				verbRes.Data = []any{datum}
				verbRes.Status = make([]intdoment.MetadataModelVerboseResponseStatus, 1)
				verbRes.Status[0].StatusCode = []int{http.StatusInternalServerError}
				verbRes.Status[0].StatusMessage = []string{http.StatusText(http.StatusInternalServerError), fmt.Sprintf("get %s failed", intdoment.AbstractionsRepository().RepositoryName), err.Error()}
				failed += 1
				goto appendNewVerboseResponse
			}

			if mm == nil || iamAuthorizationRule == nil {
				verbRes.Data = []any{datum}
				verbRes.Status = make([]intdoment.MetadataModelVerboseResponseStatus, 1)
				verbRes.Status[0].StatusCode = []int{http.StatusNotFound}
				verbRes.Status[0].StatusMessage = []string{http.StatusText(http.StatusNotFound), "Content not found or not authorized to delete content"}
				failed += 1
				goto appendNewVerboseResponse
			}

			if err := n.repo.RepoAbstractionsDeleteOne(ctx, iamAuthorizationRule, mm); err != nil {
				n.logger.Log(ctx, slog.LevelError, intlib.FunctionNameAndError(n.ServiceAbstractionsDeleteMany, err).Error())
				verbRes.Data = []any{datum}
				verbRes.Status = make([]intdoment.MetadataModelVerboseResponseStatus, 1)
				verbRes.Status[0].StatusCode = []int{http.StatusInternalServerError}
				verbRes.Status[0].StatusMessage = []string{http.StatusText(http.StatusInternalServerError), "delete/deactivate failed", err.Error()}
				failed += 1
				goto appendNewVerboseResponse
			} else {
				verbRes.Data = []any{datum}
				verbRes.Status = make([]intdoment.MetadataModelVerboseResponseStatus, 1)
				verbRes.Status[0].StatusCode = []int{http.StatusOK}
				verbRes.Status[0].StatusMessage = []string{http.StatusText(http.StatusOK), "delete/deactivate successful"}
				successful += 1
				goto appendNewVerboseResponse
			}
		} else {
			verbRes.Data = []any{datum}
			verbRes.Status = make([]intdoment.MetadataModelVerboseResponseStatus, 1)
			verbRes.Status[0].StatusCode = []int{http.StatusBadRequest}
			verbRes.Status[0].StatusMessage = []string{http.StatusText(http.StatusBadRequest), "data is not valid"}
			failed += 1
		}
	appendNewVerboseResponse:
		verbres.MetadataModelVerboseResponse.Data = append(verbres.MetadataModelVerboseResponse.Data, verbRes)
	}

	verbres.Message = fmt.Sprintf("Delete/Deactivate %[1]s: %[2]d/%[4]d successful and %[3]d/%[4]d failed", intdoment.AbstractionsRepository().RepositoryName, successful, failed, len(data))
	verbres.Successful = successful
	verbres.Failed = failed

	return http.StatusOK, verbres, nil
}

func (n *service) ServiceAbstractionsUpdateMany(
	ctx context.Context,
	iamCredential *intdoment.IamCredentials,
	iamAuthorizationRules *intdoment.IamAuthorizationRules,
	authContextDirectoryGroupID uuid.UUID,
	verboseResponse bool,
	data []*intdoment.Abstractions,
) (int, *intdoment.MetadataModelVerbRes, error) {
	verbres := new(intdoment.MetadataModelVerbRes)
	verbres.MetadataModelVerboseResponse = new(intdoment.MetadataModelVerboseResponse)
	if verboseResponse {
		if d, err := intlib.MetadataModelMiscGet(intlib.METADATA_MODELS_MISC_VERBOSE_RESPONSE); err != nil {
			n.logger.Log(ctx, slog.LevelError, intlib.FunctionNameAndError(n.ServiceAbstractionsUpdateMany, err).Error())
			return 0, nil, intlib.NewError(http.StatusInternalServerError, fmt.Sprintf("Get %v metadata-model failed", intlib.METADATA_MODELS_MISC_VERBOSE_RESPONSE))
		} else {
			verbres.MetadataModelVerboseResponse.MetadataModel = d
		}
	}
	verbres.MetadataModelVerboseResponse.Data = make([]*intdoment.MetadataModelVerboseResponseData, 0)

	successful := 0
	failed := 0
	for _, datum := range data {
		verbRes := new(intdoment.MetadataModelVerboseResponseData)

		if len(datum.ID) > 0 {
			if err := n.repo.RepoAbstractionsUpdateOne(ctx, iamCredential, iamAuthorizationRules, authContextDirectoryGroupID, datum); err != nil {
				n.logger.Log(ctx, slog.LevelError, intlib.FunctionNameAndError(n.ServiceAbstractionsUpdateMany, err).Error())
				verbRes.Data = []any{datum}
				verbRes.Status = make([]intdoment.MetadataModelVerboseResponseStatus, 1)
				verbRes.Status[0].StatusCode = []int{http.StatusInternalServerError}
				verbRes.Status[0].StatusMessage = []string{http.StatusText(http.StatusInternalServerError), "update failed", err.Error()}
				failed += 1
				goto appendNewVerboseResponse
			} else {
				verbRes.Data = []any{datum}
				verbRes.Status = make([]intdoment.MetadataModelVerboseResponseStatus, 1)
				verbRes.Status[0].StatusCode = []int{http.StatusOK}
				verbRes.Status[0].StatusMessage = []string{http.StatusText(http.StatusOK), "update successful"}
				successful += 1
				goto appendNewVerboseResponse
			}
		} else {
			verbRes.Data = []any{datum}
			verbRes.Status = make([]intdoment.MetadataModelVerboseResponseStatus, 1)
			verbRes.Status[0].StatusCode = []int{http.StatusBadRequest}
			verbRes.Status[0].StatusMessage = []string{http.StatusText(http.StatusBadRequest), "data is not valid"}
			failed += 1
		}
	appendNewVerboseResponse:
		verbres.MetadataModelVerboseResponse.Data = append(verbres.MetadataModelVerboseResponse.Data, verbRes)
	}

	verbres.Message = fmt.Sprintf("Update %[1]s: %[2]d/%[4]d successful and %[3]d/%[4]d failed", intdoment.AbstractionsRepository().RepositoryName, successful, failed, len(data))
	verbres.Successful = successful
	verbres.Failed = failed

	return http.StatusOK, verbres, nil
}

func (n *service) ServiceAbstractionsInsertMany(
	ctx context.Context,
	iamCredential *intdoment.IamCredentials,
	iamAuthorizationRules *intdoment.IamAuthorizationRules,
	authContextDirectoryGroupID uuid.UUID,
	verboseResponse bool,
	data []*intdoment.Abstractions,
	doNotSkipIFAbstractionWithFileIDExists bool,
) (int, *intdoment.MetadataModelVerbRes, error) {
	verbres := new(intdoment.MetadataModelVerbRes)
	verbres.MetadataModelVerboseResponse = new(intdoment.MetadataModelVerboseResponse)
	if verboseResponse {
		if d, err := intlib.MetadataModelMiscGet(intlib.METADATA_MODELS_MISC_VERBOSE_RESPONSE); err != nil {
			n.logger.Log(ctx, slog.LevelError, intlib.FunctionNameAndError(n.ServiceAbstractionsInsertMany, err).Error())
			return 0, nil, intlib.NewError(http.StatusInternalServerError, fmt.Sprintf("Get %v metadata-model failed", intlib.METADATA_MODELS_MISC_VERBOSE_RESPONSE))
		} else {
			verbres.MetadataModelVerboseResponse.MetadataModel = d
		}
	}
	verbres.MetadataModelVerboseResponse.Data = make([]*intdoment.MetadataModelVerboseResponseData, 0)

	successful := 0
	failed := 0
	for _, datum := range data {
		verbRes := new(intdoment.MetadataModelVerboseResponseData)

		if len(datum.DirectoryID) > 0 && len(datum.StorageFilesID) > 0 {
			iamAuthorizationRule := new(intdoment.IamAuthorizationRule)
			if len(iamCredential.DirectoryID) > 0 && iamCredential.DirectoryID[0].String() == datum.DirectoryID[0].String() {
				if iar, err := n.repo.RepoIamGroupAuthorizationsGetAuthorized(
					ctx,
					iamCredential,
					authContextDirectoryGroupID,
					[]*intdoment.IamGroupAuthorizationRule{
						{
							ID:        intdoment.AUTH_RULE_CREATE,
							RuleGroup: intdoment.AUTH_RULE_GROUP_ABSTRACTIONS_DIRECTORY_GROUPS,
						},
					},
					iamAuthorizationRules,
				); err != nil {
					verbRes.Data = []any{datum}
					verbRes.Status = make([]intdoment.MetadataModelVerboseResponseStatus, 1)
					verbRes.Status[0].StatusCode = []int{http.StatusInternalServerError}
					verbRes.Status[0].StatusMessage = []string{http.StatusText(http.StatusInternalServerError), "get iam auth rule failed", err.Error()}
					failed += 1
					goto appendNewVerboseResponse
				} else if iar == nil {
					verbRes.Data = []any{datum}
					verbRes.Status = make([]intdoment.MetadataModelVerboseResponseStatus, 1)
					verbRes.Status[0].StatusCode = []int{http.StatusForbidden}
					verbRes.Status[0].StatusMessage = []string{http.StatusText(http.StatusForbidden)}
					failed += 1
					goto appendNewVerboseResponse
				} else {
					iamAuthorizationRule = iar[0]
				}
			} else {
				if iar, err := n.repo.RepoIamGroupAuthorizationsGetAuthorized(
					ctx,
					iamCredential,
					authContextDirectoryGroupID,
					[]*intdoment.IamGroupAuthorizationRule{
						{
							ID:        intdoment.AUTH_RULE_CREATE_OTHERS,
							RuleGroup: intdoment.AUTH_RULE_GROUP_ABSTRACTIONS_DIRECTORY_GROUPS,
						},
					},
					iamAuthorizationRules,
				); err != nil {
					verbRes.Data = []any{datum}
					verbRes.Status = make([]intdoment.MetadataModelVerboseResponseStatus, 1)
					verbRes.Status[0].StatusCode = []int{http.StatusInternalServerError}
					verbRes.Status[0].StatusMessage = []string{http.StatusText(http.StatusInternalServerError), "get iam auth rule failed", err.Error()}
					failed += 1
					goto appendNewVerboseResponse
				} else if iar == nil {
					verbRes.Data = []any{datum}
					verbRes.Status = make([]intdoment.MetadataModelVerboseResponseStatus, 1)
					verbRes.Status[0].StatusCode = []int{http.StatusForbidden}
					verbRes.Status[0].StatusMessage = []string{http.StatusText(http.StatusForbidden)}
					failed += 1
					goto appendNewVerboseResponse
				} else {
					iamAuthorizationRule = iar[0]
				}
			}

			if !doNotSkipIFAbstractionWithFileIDExists {
				if value, err := n.repo.RepoAbstractionsFindManyByAbstractionsDirectoryGroupsIDAndStorageFilesID(ctx, authContextDirectoryGroupID, datum.StorageFilesID[0], nil); err != nil {
					n.logger.Log(ctx, slog.LevelError, intlib.FunctionNameAndError(n.ServiceAbstractionsInsertMany, err).Error())
					verbRes.Data = []any{datum}
					verbRes.Status = make([]intdoment.MetadataModelVerboseResponseStatus, 1)
					verbRes.Status[0].StatusCode = []int{http.StatusInternalServerError}
					verbRes.Status[0].StatusMessage = []string{http.StatusText(http.StatusInternalServerError), fmt.Sprintf("validate existance %s failed", intdoment.AbstractionsRepository().RepositoryName), err.Error()}
					failed += 1
					goto appendNewVerboseResponse
				} else {
					if value != nil {
						verbRes.Data = []any{datum}
						verbRes.Status = make([]intdoment.MetadataModelVerboseResponseStatus, 1)
						verbRes.Status[0].StatusCode = []int{http.StatusBadRequest}
						verbRes.Status[0].StatusMessage = []string{http.StatusText(http.StatusBadRequest), fmt.Sprintf("%s already exists", intdoment.AbstractionsRepository().RepositoryName)}
						failed += 1
						goto appendNewVerboseResponse
					}
				}
			}

			if value, err := n.repo.RepoAbstractionsInsertOne(ctx, iamAuthorizationRule, authContextDirectoryGroupID, datum, nil); err != nil {
				n.logger.Log(ctx, slog.LevelError, intlib.FunctionNameAndError(n.ServiceAbstractionsInsertMany, err).Error())
				verbRes.Data = []any{datum}
				verbRes.Status = make([]intdoment.MetadataModelVerboseResponseStatus, 1)
				verbRes.Status[0].StatusCode = []int{http.StatusInternalServerError}
				verbRes.Status[0].StatusMessage = []string{http.StatusText(http.StatusInternalServerError), "insert failed", err.Error()}
				failed += 1
				goto appendNewVerboseResponse
			} else {
				verbRes.Data = []any{value}
				verbRes.Status = make([]intdoment.MetadataModelVerboseResponseStatus, 1)
				verbRes.Status[0].StatusCode = []int{http.StatusOK}
				verbRes.Status[0].StatusMessage = []string{http.StatusText(http.StatusOK), "creation successful"}
				successful += 1
				goto appendNewVerboseResponse
			}
		} else {
			verbRes.Data = []any{datum}
			verbRes.Status = make([]intdoment.MetadataModelVerboseResponseStatus, 1)
			verbRes.Status[0].StatusCode = []int{http.StatusBadRequest}
			verbRes.Status[0].StatusMessage = []string{http.StatusText(http.StatusBadRequest), "data is not valid"}
			failed += 1
		}

	appendNewVerboseResponse:
		verbres.MetadataModelVerboseResponse.Data = append(verbres.MetadataModelVerboseResponse.Data, verbRes)
	}

	verbres.Message = fmt.Sprintf("Create %[1]s: %[2]d/%[4]d successful and %[3]d/%[4]d failed", intdoment.AbstractionsRepository().RepositoryName, successful, failed, len(data))
	verbres.Successful = successful
	verbres.Failed = failed

	return http.StatusOK, verbres, nil
}

func (n *service) ServiceGetAbstractionPageHtml(
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
				n.logger.Log(ctx, slog.LevelError, intlib.FunctionNameAndError(n.ServiceGetAbstractionsPageHtml, err).Error())
				return nil, intlib.NewError(http.StatusInternalServerError, "Parse template failed")
			} else {
				if err := websiteTemplate.WebsiteTemplateSetBaseTemplate(baseTemplate); err != nil {
					n.logger.Log(ctx, slog.LevelError, intlib.FunctionNameAndError(n.ServiceGetAbstractionsPageHtml, err).Error())
					return nil, intlib.NewError(http.StatusInternalServerError, "Parse template failed")
				}
			}

			if err := websiteTemplate.WebsiteTemplateRegisterPartialFile(ctx, intdoment.WEBSITE_HTMLTMPL_ROUTES_GROUPID_ABSTRACTIONS_ID_PAGE, intdoment.WEBSITE_HTMLTMPL_PRTL_ROUTESGROUPID); err != nil {
				n.logger.Log(ctx, slog.LevelError, intlib.FunctionNameAndError(n.ServiceGetAbstractionsPageHtml, err).Error())
				return nil, intlib.NewError(http.StatusInternalServerError, "Parse template failed")
			}
		case intdoment.WEBSITE_HTMLTMPL_PRTL_ROUTESGROUPID:
			if baseTemplate, err := websiteTemplate.WebsiteTemplateParseFile(ctx, intdoment.WEBSITE_HTMLTMPL_ROUTES_GROUPID_ABSTRACTIONS_ID_PAGE); err != nil {
				n.logger.Log(ctx, slog.LevelError, intlib.FunctionNameAndError(n.ServiceGetAbstractionsPageHtml, err).Error())
				return nil, intlib.NewError(http.StatusInternalServerError, "Parse template failed")
			} else {
				if err := websiteTemplate.WebsiteTemplateSetBaseTemplate(baseTemplate); err != nil {
					n.logger.Log(ctx, slog.LevelError, intlib.FunctionNameAndError(n.ServiceGetAbstractionsPageHtml, err).Error())
					return nil, intlib.NewError(http.StatusInternalServerError, "Parse template failed")
				}
			}
		default:
			return nil, intlib.NewError(http.StatusBadRequest, "Invalid inline section")
		}
	} else {
		if baseTemplate, routesData, err := intlib.WebsiteGetRoutesLayout(ctx, openid, websiteTemplate, iamCredential, authContextDirectoryGroupID); err != nil {
			n.logger.Log(ctx, slog.LevelError, intlib.FunctionNameAndError(n.ServiceGetAbstractionsPageHtml, err).Error())
			return nil, intlib.NewError(http.StatusInternalServerError, "Parse template failed")
		} else {
			if err := websiteTemplate.WebsiteTemplateSetBaseTemplate(baseTemplate); err != nil {
				n.logger.Log(ctx, slog.LevelError, intlib.FunctionNameAndError(n.ServiceGetAbstractionsPageHtml, err).Error())
				return nil, intlib.NewError(http.StatusInternalServerError, "Parse template failed")
			}
			data, err = intlibjson.SetValueInObject(data, fmt.Sprintf("%s.%s", intdoment.WEBSITE_PATH_ROUTES, intdoment.WEBSITE_PATH_KEY_DATA), routesData)
			if err != nil {
				n.logger.Log(ctx, slog.LevelError, intlib.FunctionNameAndError(n.ServiceGetAbstractionsPageHtml, err).Error())
				return nil, intlib.NewError(http.StatusInternalServerError, http.StatusText(http.StatusInternalServerError))
			}
		}

		if err := websiteTemplate.WebsiteTemplateRegisterPartialFile(ctx, intdoment.WEBSITE_HTMLTMPL_ROUTES_GROUPID_LAYOUT, intdoment.WEBSITE_HTMLTMPL_PRTL_ROUTES); err != nil {
			n.logger.Log(ctx, slog.LevelError, intlib.FunctionNameAndError(n.ServiceGetAbstractionsPageHtml, err).Error())
			return nil, intlib.NewError(http.StatusInternalServerError, "Parse template failed")
		}

		if err := websiteTemplate.WebsiteTemplateRegisterPartialFile(ctx, intdoment.WEBSITE_HTMLTMPL_ROUTES_GROUPID_ABSTRACTIONS_ID_PAGE, intdoment.WEBSITE_HTMLTMPL_PRTL_ROUTESGROUPID); err != nil {
			n.logger.Log(ctx, slog.LevelError, intlib.FunctionNameAndError(n.ServiceGetAbstractionsPageHtml, err).Error())
			return nil, intlib.NewError(http.StatusInternalServerError, "Parse template failed")
		}
	}

	if err := websiteTemplate.WebsiteTemplateRegisterPartialFile(ctx, intdoment.WEBSITE_HTMLTMPL_LIB_PAGES_ERROR, intdoment.WEBSITE_HTMLTMPL_PRTL_ERROR); err != nil {
		n.logger.Log(ctx, slog.LevelError, intlib.FunctionNameAndError(n.ServiceGetAbstractionsPageHtml, err).Error())
		return nil, intlib.NewError(http.StatusInternalServerError, "Parse template failed")
	}

	if htmlContent, err := websiteTemplate.WebstieTemplateGetHtmlContext(ctx, data); err != nil {
		n.logger.Log(ctx, slog.LevelError, intlib.FunctionNameAndError(n.ServiceGetAbstractionsPageHtml, err).Error())
		return nil, intlib.NewError(http.StatusInternalServerError, "Parse template failed")
	} else {
		return &htmlContent, nil
	}
}

func (n *service) ServiceGetAbstractionsPageHtml(
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
				n.logger.Log(ctx, slog.LevelError, intlib.FunctionNameAndError(n.ServiceGetAbstractionsPageHtml, err).Error())
				return nil, intlib.NewError(http.StatusInternalServerError, "Parse template failed")
			} else {
				if err := websiteTemplate.WebsiteTemplateSetBaseTemplate(baseTemplate); err != nil {
					n.logger.Log(ctx, slog.LevelError, intlib.FunctionNameAndError(n.ServiceGetAbstractionsPageHtml, err).Error())
					return nil, intlib.NewError(http.StatusInternalServerError, "Parse template failed")
				}
			}

			if err := websiteTemplate.WebsiteTemplateRegisterPartialFile(ctx, intdoment.WEBSITE_HTMLTMPL_ROUTES_GROUPID_ABSTRACTIONS_PAGE, intdoment.WEBSITE_HTMLTMPL_PRTL_ROUTESGROUPID); err != nil {
				n.logger.Log(ctx, slog.LevelError, intlib.FunctionNameAndError(n.ServiceGetAbstractionsPageHtml, err).Error())
				return nil, intlib.NewError(http.StatusInternalServerError, "Parse template failed")
			}
		case intdoment.WEBSITE_HTMLTMPL_PRTL_ROUTESGROUPID:
			if baseTemplate, err := websiteTemplate.WebsiteTemplateParseFile(ctx, intdoment.WEBSITE_HTMLTMPL_ROUTES_GROUPID_ABSTRACTIONS_PAGE); err != nil {
				n.logger.Log(ctx, slog.LevelError, intlib.FunctionNameAndError(n.ServiceGetAbstractionsPageHtml, err).Error())
				return nil, intlib.NewError(http.StatusInternalServerError, "Parse template failed")
			} else {
				if err := websiteTemplate.WebsiteTemplateSetBaseTemplate(baseTemplate); err != nil {
					n.logger.Log(ctx, slog.LevelError, intlib.FunctionNameAndError(n.ServiceGetAbstractionsPageHtml, err).Error())
					return nil, intlib.NewError(http.StatusInternalServerError, "Parse template failed")
				}
			}
		default:
			return nil, intlib.NewError(http.StatusBadRequest, "Invalid inline section")
		}
	} else {
		if baseTemplate, routesData, err := intlib.WebsiteGetRoutesLayout(ctx, openid, websiteTemplate, iamCredential, authContextDirectoryGroupID); err != nil {
			n.logger.Log(ctx, slog.LevelError, intlib.FunctionNameAndError(n.ServiceGetAbstractionsPageHtml, err).Error())
			return nil, intlib.NewError(http.StatusInternalServerError, "Parse template failed")
		} else {
			if err := websiteTemplate.WebsiteTemplateSetBaseTemplate(baseTemplate); err != nil {
				n.logger.Log(ctx, slog.LevelError, intlib.FunctionNameAndError(n.ServiceGetAbstractionsPageHtml, err).Error())
				return nil, intlib.NewError(http.StatusInternalServerError, "Parse template failed")
			}
			data, err = intlibjson.SetValueInObject(data, fmt.Sprintf("%s.%s", intdoment.WEBSITE_PATH_ROUTES, intdoment.WEBSITE_PATH_KEY_DATA), routesData)
			if err != nil {
				n.logger.Log(ctx, slog.LevelError, intlib.FunctionNameAndError(n.ServiceGetAbstractionsPageHtml, err).Error())
				return nil, intlib.NewError(http.StatusInternalServerError, http.StatusText(http.StatusInternalServerError))
			}
		}

		if err := websiteTemplate.WebsiteTemplateRegisterPartialFile(ctx, intdoment.WEBSITE_HTMLTMPL_ROUTES_GROUPID_LAYOUT, intdoment.WEBSITE_HTMLTMPL_PRTL_ROUTES); err != nil {
			n.logger.Log(ctx, slog.LevelError, intlib.FunctionNameAndError(n.ServiceGetAbstractionsPageHtml, err).Error())
			return nil, intlib.NewError(http.StatusInternalServerError, "Parse template failed")
		}

		if err := websiteTemplate.WebsiteTemplateRegisterPartialFile(ctx, intdoment.WEBSITE_HTMLTMPL_ROUTES_GROUPID_ABSTRACTIONS_PAGE, intdoment.WEBSITE_HTMLTMPL_PRTL_ROUTESGROUPID); err != nil {
			n.logger.Log(ctx, slog.LevelError, intlib.FunctionNameAndError(n.ServiceGetAbstractionsPageHtml, err).Error())
			return nil, intlib.NewError(http.StatusInternalServerError, "Parse template failed")
		}
	}

	if err := websiteTemplate.WebsiteTemplateRegisterPartialFile(ctx, intdoment.WEBSITE_HTMLTMPL_LIB_PAGES_ERROR, intdoment.WEBSITE_HTMLTMPL_PRTL_ERROR); err != nil {
		n.logger.Log(ctx, slog.LevelError, intlib.FunctionNameAndError(n.ServiceGetAbstractionsPageHtml, err).Error())
		return nil, intlib.NewError(http.StatusInternalServerError, "Parse template failed")
	}

	if htmlContent, err := websiteTemplate.WebstieTemplateGetHtmlContext(ctx, data); err != nil {
		n.logger.Log(ctx, slog.LevelError, intlib.FunctionNameAndError(n.ServiceGetAbstractionsPageHtml, err).Error())
		return nil, intlib.NewError(http.StatusInternalServerError, "Parse template failed")
	} else {
		return &htmlContent, nil
	}
}

func (n *service) ServiceAbstractionsSearch(
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
	if value, err := n.repo.RepoAbstractionsSearch(
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
		n.logger.Log(ctx, slog.LevelError, intlib.FunctionNameAndError(n.ServiceAbstractionsSearch, err).Error())
		return nil, intlib.NewError(http.StatusInternalServerError, http.StatusText(http.StatusInternalServerError))
	} else {
		return value, nil
	}
}

func (n *service) ServiceAbstractionsGetMetadataModel(ctx context.Context, metadataModelRetrieve intdomint.MetadataModelRetrieve, targetJoinDepth int) (map[string]any, error) {
	if value, err := metadataModelRetrieve.AbstractionsGetMetadataModel(ctx, 0, targetJoinDepth, nil); err != nil {
		n.logger.Log(ctx, slog.LevelWarn+1, intlib.FunctionNameAndError(n.ServiceAbstractionsGetMetadataModel, err).Error())
		return nil, intlib.NewError(http.StatusInternalServerError, http.StatusText(http.StatusInternalServerError))
	} else {
		return value, nil
	}
}

func (n *service) ServiceAbstractionsMetadataModelGet(ctx context.Context, directoryGroupID uuid.UUID) (map[string]any, error) {
	if value, err := n.repo.RepoMetadataModelFindOneByAbstractionsDirectoryGroupsID(ctx, directoryGroupID); err != nil {
		n.logger.Log(ctx, slog.LevelError, fmt.Sprintf("Get metadata-model failed, error: %v", err), intlib.FunctionName(n.ServiceAbstractionsMetadataModelGet))
		return nil, intlib.NewError(http.StatusInternalServerError, http.StatusText(http.StatusInternalServerError))
	} else {
		if value == nil {
			return nil, intlib.NewError(http.StatusNotFound, http.StatusText(http.StatusNotFound))
		}
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

type service struct {
	repo   intdomint.RouteAbstractionsRepository
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

const param_DO_NOT_SKIP_IF_ABSTRACTION_WITH_FILE_ID_EXISTS string = "do_not_skip_if_abstraction_with_file_id_exists"
