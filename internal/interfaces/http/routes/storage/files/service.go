package files

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
	"net/http"
	"regexp"
	"strings"

	"github.com/gofrs/uuid/v5"
	intdoment "github.com/icipe-official/Data-Abstraction-Platform/internal/domain/entities"
	intdomint "github.com/icipe-official/Data-Abstraction-Platform/internal/domain/interfaces"
	inthttp "github.com/icipe-official/Data-Abstraction-Platform/internal/interfaces/http"
	intlib "github.com/icipe-official/Data-Abstraction-Platform/internal/lib"
	intlibjson "github.com/icipe-official/Data-Abstraction-Platform/internal/lib/json"
)

func (n *service) ServiceStorageFilesDeleteMany(
	ctx context.Context,
	iamCredential *intdoment.IamCredentials,
	iamAuthorizationRules *intdoment.IamAuthorizationRules,
	authContextDirectoryGroupID uuid.UUID,
	verboseResponse bool,
	data []*intdoment.StorageFiles,
	fileManagement intdomint.FileManagement,
) (int, *intdoment.MetadataModelVerbRes, error) {
	verbres := new(intdoment.MetadataModelVerbRes)
	verbres.MetadataModelVerboseResponse = new(intdoment.MetadataModelVerboseResponse)
	if verboseResponse {
		if d, err := intlib.MetadataModelMiscGet(intlib.METADATA_MODELS_MISC_VERBOSE_RESPONSE); err != nil {
			n.logger.Log(ctx, slog.LevelError, intlib.FunctionNameAndError(n.ServiceStorageFilesDeleteMany, err).Error())
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
			sf, iamAuthorizationRule, err := n.repo.RepoStorageFilesFindOneForDeletionByID(ctx, iamCredential, iamAuthorizationRules, authContextDirectoryGroupID, datum, nil)
			if err != nil {
				n.logger.Log(ctx, slog.LevelError, intlib.FunctionNameAndError(n.ServiceStorageFilesDeleteMany, err).Error())
				verbRes.Data = []any{datum}
				verbRes.Status = make([]intdoment.MetadataModelVerboseResponseStatus, 1)
				verbRes.Status[0].StatusCode = []int{http.StatusInternalServerError}
				verbRes.Status[0].StatusMessage = []string{http.StatusText(http.StatusInternalServerError), fmt.Sprintf("get %s failed", intdoment.StorageFilesRepository().RepositoryName), err.Error()}
				failed += 1
				goto appendNewVerboseResponse
			}

			if sf == nil || iamAuthorizationRule == nil {
				verbRes.Data = []any{datum}
				verbRes.Status = make([]intdoment.MetadataModelVerboseResponseStatus, 1)
				verbRes.Status[0].StatusCode = []int{http.StatusNotFound}
				verbRes.Status[0].StatusMessage = []string{http.StatusText(http.StatusNotFound), "Content not found or not authorized to delete content"}
				failed += 1
				goto appendNewVerboseResponse
			}

			storageDrive, err := n.repo.RepoStorageDrivesFindOneActiveByStorageDrivesGroup(ctx, sf.StorageDrivesID[0], sf.DirectoryGroupsID[0], nil)
			if err != nil {
				n.logger.Log(ctx, slog.LevelError, intlib.FunctionNameAndError(n.ServiceStorageFilesDownload, fmt.Errorf("get %s failed, error: %v", intdoment.StorageDrivesRepository().RepositoryName, err)).Error())
				n.logger.Log(ctx, slog.LevelError, intlib.FunctionNameAndError(n.ServiceStorageFilesDeleteMany, err).Error())
				verbRes.Data = []any{datum}
				verbRes.Status = make([]intdoment.MetadataModelVerboseResponseStatus, 1)
				verbRes.Status[0].StatusCode = []int{http.StatusInternalServerError}
				verbRes.Status[0].StatusMessage = []string{http.StatusText(http.StatusInternalServerError), fmt.Sprintf("get %s failed", intdoment.StorageDrivesRepository().RepositoryName), err.Error()}
				failed += 1
				goto appendNewVerboseResponse
			}

			if err := n.repo.RepoStorageFilesDeleteOne(ctx, iamAuthorizationRule, fileManagement, sf, storageDrive); err != nil {
				n.logger.Log(ctx, slog.LevelError, intlib.FunctionNameAndError(n.ServiceStorageFilesDeleteMany, err).Error())
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

	verbres.Message = fmt.Sprintf("Delete/Deactivate %[1]s: %[2]d/%[4]d successful and %[3]d/%[4]d failed", intdoment.StorageFilesRepository().RepositoryName, successful, failed, len(data))
	verbres.Successful = successful
	verbres.Failed = failed

	return http.StatusOK, verbres, nil
}

func (n *service) ServiceStorageFilesUpdateMany(
	ctx context.Context,
	iamCredential *intdoment.IamCredentials,
	iamAuthorizationRules *intdoment.IamAuthorizationRules,
	authContextDirectoryGroupID uuid.UUID,
	verboseResponse bool,
	data []*intdoment.StorageFiles,
) (int, *intdoment.MetadataModelVerbRes, error) {
	verbres := new(intdoment.MetadataModelVerbRes)
	verbres.MetadataModelVerboseResponse = new(intdoment.MetadataModelVerboseResponse)
	if verboseResponse {
		if d, err := intlib.MetadataModelMiscGet(intlib.METADATA_MODELS_MISC_VERBOSE_RESPONSE); err != nil {
			n.logger.Log(ctx, slog.LevelError, intlib.FunctionNameAndError(n.ServiceStorageFilesUpdateMany, err).Error())
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
			if err := n.repo.RepoStorageFilesUpdateOne(ctx, iamCredential, iamAuthorizationRules, authContextDirectoryGroupID, datum); err != nil {
				n.logger.Log(ctx, slog.LevelError, intlib.FunctionNameAndError(n.ServiceStorageFilesUpdateMany, err).Error())
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

	verbres.Message = fmt.Sprintf("Update %[1]s: %[2]d/%[4]d successful and %[3]d/%[4]d failed", intdoment.StorageFilesRepository().RepositoryName, successful, failed, len(data))
	verbres.Successful = successful
	verbres.Failed = failed

	return http.StatusOK, verbres, nil
}

func (n *service) ServiceStorageFilesDownload(ctx context.Context, storageFile *intdoment.StorageFiles, fileManagement intdomint.FileManagement, w http.ResponseWriter) error {
	if len(storageFile.ID) == 0 || len(storageFile.DirectoryGroupsID) == 0 || len(storageFile.StorageDrivesID) == 0 {
		return intlib.NewError(http.StatusBadRequest, http.StatusText(http.StatusBadRequest))
	}

	storageDrive, err := n.repo.RepoStorageDrivesFindOneActiveByStorageDrivesGroup(ctx, storageFile.StorageDrivesID[0], storageFile.DirectoryGroupsID[0], nil)
	if err != nil {
		n.logger.Log(ctx, slog.LevelError, intlib.FunctionNameAndError(n.ServiceStorageFilesDownload, fmt.Errorf("get %s failed, error: %v", intdoment.StorageDrivesRepository().RepositoryName, err)).Error())
		return intlib.NewError(http.StatusInternalServerError, http.StatusText(http.StatusInternalServerError))
	}

	if err := fileManagement.Download(ctx, storageFile, storageDrive, w); err != nil {
		n.logger.Log(ctx, slog.LevelError, intlib.FunctionNameAndError(n.ServiceStorageFilesDownload, fmt.Errorf("download %s failed, error: %v", intdoment.StorageFilesRepository().RepositoryName, err)).Error())
		return intlib.NewError(http.StatusInternalServerError, http.StatusText(http.StatusInternalServerError))
	}

	return nil
}

func (n *service) ServiceStorageFileCreate(
	ctx context.Context,
	iamCredential *intdoment.IamCredentials,
	authContextDirectoryGroupID uuid.UUID,
	ffu intdomint.FormFileUpload,
	fileManagement intdomint.FileManagement,
) (*intdoment.StorageFiles, error) {
	if len(iamCredential.DirectoryID) == 0 {
		return nil, intlib.NewError(http.StatusForbidden, "no directoryID linked to iamCredential")
	}

	storageFiles := new(intdoment.StorageFiles)
	if value, err := uuid.FromString(ffu.FormValue(intdoment.StorageFilesRepository().StorageDrivesID)); err != nil {
		return nil, intlib.NewError(http.StatusBadRequest, http.StatusText(http.StatusBadRequest))
	} else {
		storageFiles.StorageDrivesID = []uuid.UUID{value}
	}

	if value, err := uuid.FromString(ffu.FormValue(intdoment.StorageFilesRepository().DirectoryGroupsID)); err != nil {
		return nil, intlib.NewError(http.StatusBadRequest, http.StatusText(http.StatusBadRequest))
	} else {
		storageFiles.DirectoryGroupsID = []uuid.UUID{value}
	}

	if storageFiles.DirectoryGroupsID[0].String() != authContextDirectoryGroupID.String() {
		return nil, intlib.NewError(http.StatusBadRequest, "storageFiles.DirectoryGroupsID[0] not equal to authContextDirectoryGroupID")
	}

	iamAuthorizationRule := new(intdoment.IamAuthorizationRule)
	if iar, err := n.repo.RepoIamGroupAuthorizationsGetAuthorized(
		ctx,
		iamCredential,
		authContextDirectoryGroupID,
		[]*intdoment.IamGroupAuthorizationRule{
			{
				ID:        intdoment.AUTH_RULE_CREATE,
				RuleGroup: intdoment.AUTH_RULE_GROUP_STORAGE_FILES,
			},
		},
		nil,
	); err != nil {
		n.logger.Log(ctx, slog.LevelError, intlib.FunctionNameAndError(n.ServiceStorageFileCreate, fmt.Errorf("get iam auth rule failed, error: %v", err)).Error())
		return nil, intlib.NewError(http.StatusInternalServerError, http.StatusText(http.StatusInternalServerError))
	} else if iar == nil {
		return nil, intlib.NewError(http.StatusForbidden, http.StatusText(http.StatusForbidden))
	} else {
		iamAuthorizationRule = iar[0]
	}

	storageDrives, err := n.repo.RepoStorageDrivesFindOneActiveByStorageDrivesGroup(ctx, storageFiles.StorageDrivesID[0], storageFiles.DirectoryGroupsID[0], nil)
	if err != nil {
		n.logger.Log(ctx, slog.LevelError, intlib.FunctionNameAndError(n.ServiceStorageFileCreate, fmt.Errorf("get %s failed, error: %v", intdoment.StorageDrivesRepository().RepositoryName, err)).Error())
		return nil, intlib.NewError(http.StatusInternalServerError, http.StatusText(http.StatusInternalServerError))
	}
	if storageDrives == nil {
		return nil, intlib.NewError(http.StatusBadRequest, fmt.Sprintf("no active %s found", intdoment.StorageDrivesRepository().RepositoryName))
	}

	file, handler, err := ffu.FormFile(intdoment.StorageFilesRepository().RepositoryName)
	if err != nil {
		return nil, intlib.NewError(http.StatusBadRequest, http.StatusText(http.StatusBadRequest))
	}
	defer file.Close()

	storageFiles.OriginalName = []string{handler.Filename}
	storageFiles.Tags = []string{regexp.MustCompile(`[^a-zA-Z0-9]`).ReplaceAllString(handler.Filename, " ")}
	if value := ffu.FormValue(intdoment.StorageFilesRepository().Tags); len(value) > 0 {
		storageFiles.Tags = append(storageFiles.Tags, strings.Split(value, ",")...)
	}
	storageFiles.StorageFileMimeType = []string{handler.Header.Get("Content-Type")}

	if value, err := n.repo.RepoStorageFilesInsertOne(ctx, iamAuthorizationRule, fileManagement, storageFiles, storageDrives, iamCredential.DirectoryID[0], file, nil); err != nil {
		n.logger.Log(ctx, slog.LevelError, intlib.FunctionNameAndError(n.ServiceStorageFileCreate, fmt.Errorf("create %s failed, error: %v", intdoment.StorageFilesRepository().RepositoryName, err)).Error())
		return nil, intlib.NewError(http.StatusInternalServerError, http.StatusText(http.StatusInternalServerError))
	} else {
		return value, nil
	}
}

func (n *service) ServiceGetStorageFilesPageHtml(
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
				n.logger.Log(ctx, slog.LevelError, intlib.FunctionNameAndError(n.ServiceGetStorageFilesPageHtml, err).Error())
				return nil, intlib.NewError(http.StatusInternalServerError, "Parse template failed")
			} else {
				if err := websiteTemplate.WebsiteTemplateSetBaseTemplate(baseTemplate); err != nil {
					n.logger.Log(ctx, slog.LevelError, intlib.FunctionNameAndError(n.ServiceGetStorageFilesPageHtml, err).Error())
					return nil, intlib.NewError(http.StatusInternalServerError, "Parse template failed")
				}
			}

			if err := websiteTemplate.WebsiteTemplateRegisterPartialFile(ctx, intdoment.WEBSITE_HTMLTMPL_ROUTES_GROUPID_STORAGE_FILES_PAGE, intdoment.WEBSITE_HTMLTMPL_PRTL_ROUTESGROUPID); err != nil {
				n.logger.Log(ctx, slog.LevelError, intlib.FunctionNameAndError(n.ServiceGetStorageFilesPageHtml, err).Error())
				return nil, intlib.NewError(http.StatusInternalServerError, "Parse template failed")
			}
		case intdoment.WEBSITE_HTMLTMPL_PRTL_ROUTESGROUPID:
			if baseTemplate, err := websiteTemplate.WebsiteTemplateParseFile(ctx, intdoment.WEBSITE_HTMLTMPL_ROUTES_GROUPID_STORAGE_FILES_PAGE); err != nil {
				n.logger.Log(ctx, slog.LevelError, intlib.FunctionNameAndError(n.ServiceGetStorageFilesPageHtml, err).Error())
				return nil, intlib.NewError(http.StatusInternalServerError, "Parse template failed")
			} else {
				if err := websiteTemplate.WebsiteTemplateSetBaseTemplate(baseTemplate); err != nil {
					n.logger.Log(ctx, slog.LevelError, intlib.FunctionNameAndError(n.ServiceGetStorageFilesPageHtml, err).Error())
					return nil, intlib.NewError(http.StatusInternalServerError, "Parse template failed")
				}
			}
		default:
			return nil, intlib.NewError(http.StatusBadRequest, "Invalid inline section")
		}
	} else {
		if baseTemplate, routesData, err := intlib.WebsiteGetRoutesLayout(ctx, openid, websiteTemplate, iamCredential, authContextDirectoryGroupID); err != nil {
			n.logger.Log(ctx, slog.LevelError, intlib.FunctionNameAndError(n.ServiceGetStorageFilesPageHtml, err).Error())
			return nil, intlib.NewError(http.StatusInternalServerError, "Parse template failed")
		} else {
			if err := websiteTemplate.WebsiteTemplateSetBaseTemplate(baseTemplate); err != nil {
				n.logger.Log(ctx, slog.LevelError, intlib.FunctionNameAndError(n.ServiceGetStorageFilesPageHtml, err).Error())
				return nil, intlib.NewError(http.StatusInternalServerError, "Parse template failed")
			}
			data, err = intlibjson.SetValueInObject(data, fmt.Sprintf("%s.%s", intdoment.WEBSITE_PATH_ROUTES, intdoment.WEBSITE_PATH_KEY_DATA), routesData)
			if err != nil {
				n.logger.Log(ctx, slog.LevelError, intlib.FunctionNameAndError(n.ServiceGetStorageFilesPageHtml, err).Error())
				return nil, intlib.NewError(http.StatusInternalServerError, http.StatusText(http.StatusInternalServerError))
			}
		}

		if err := websiteTemplate.WebsiteTemplateRegisterPartialFile(ctx, intdoment.WEBSITE_HTMLTMPL_ROUTES_GROUPID_LAYOUT, intdoment.WEBSITE_HTMLTMPL_PRTL_ROUTES); err != nil {
			n.logger.Log(ctx, slog.LevelError, intlib.FunctionNameAndError(n.ServiceGetStorageFilesPageHtml, err).Error())
			return nil, intlib.NewError(http.StatusInternalServerError, "Parse template failed")
		}

		if err := websiteTemplate.WebsiteTemplateRegisterPartialFile(ctx, intdoment.WEBSITE_HTMLTMPL_ROUTES_GROUPID_STORAGE_FILES_PAGE, intdoment.WEBSITE_HTMLTMPL_PRTL_ROUTESGROUPID); err != nil {
			n.logger.Log(ctx, slog.LevelError, intlib.FunctionNameAndError(n.ServiceGetStorageFilesPageHtml, err).Error())
			return nil, intlib.NewError(http.StatusInternalServerError, "Parse template failed")
		}
	}

	if err := websiteTemplate.WebsiteTemplateRegisterPartialFile(ctx, intdoment.WEBSITE_HTMLTMPL_LIB_PAGES_ERROR, intdoment.WEBSITE_HTMLTMPL_PRTL_ERROR); err != nil {
		n.logger.Log(ctx, slog.LevelError, intlib.FunctionNameAndError(n.ServiceGetStorageFilesPageHtml, err).Error())
		return nil, intlib.NewError(http.StatusInternalServerError, "Parse template failed")
	}

	if htmlContent, err := websiteTemplate.WebstieTemplateGetHtmlContext(ctx, data); err != nil {
		n.logger.Log(ctx, slog.LevelError, intlib.FunctionNameAndError(n.ServiceGetStorageFilesPageHtml, err).Error())
		return nil, intlib.NewError(http.StatusInternalServerError, "Parse template failed")
	} else {
		return &htmlContent, nil
	}
}

func (n *service) ServiceGetStorageFilePageHtml(
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
				n.logger.Log(ctx, slog.LevelError, intlib.FunctionNameAndError(n.ServiceGetStorageFilePageHtml, err).Error())
				return nil, intlib.NewError(http.StatusInternalServerError, "Parse template failed")
			} else {
				if err := websiteTemplate.WebsiteTemplateSetBaseTemplate(baseTemplate); err != nil {
					n.logger.Log(ctx, slog.LevelError, intlib.FunctionNameAndError(n.ServiceGetStorageFilePageHtml, err).Error())
					return nil, intlib.NewError(http.StatusInternalServerError, "Parse template failed")
				}
			}

			if err := websiteTemplate.WebsiteTemplateRegisterPartialFile(ctx, intdoment.WEBSITE_HTMLTMPL_ROUTES_GROUPID_STORAGE_FILES_ID_PAGE, intdoment.WEBSITE_HTMLTMPL_PRTL_ROUTESGROUPID); err != nil {
				n.logger.Log(ctx, slog.LevelError, intlib.FunctionNameAndError(n.ServiceGetStorageFilePageHtml, err).Error())
				return nil, intlib.NewError(http.StatusInternalServerError, "Parse template failed")
			}
		case intdoment.WEBSITE_HTMLTMPL_PRTL_ROUTESGROUPID:
			if baseTemplate, err := websiteTemplate.WebsiteTemplateParseFile(ctx, intdoment.WEBSITE_HTMLTMPL_ROUTES_GROUPID_STORAGE_FILES_ID_PAGE); err != nil {
				n.logger.Log(ctx, slog.LevelError, intlib.FunctionNameAndError(n.ServiceGetStorageFilePageHtml, err).Error())
				return nil, intlib.NewError(http.StatusInternalServerError, "Parse template failed")
			} else {
				if err := websiteTemplate.WebsiteTemplateSetBaseTemplate(baseTemplate); err != nil {
					n.logger.Log(ctx, slog.LevelError, intlib.FunctionNameAndError(n.ServiceGetStorageFilePageHtml, err).Error())
					return nil, intlib.NewError(http.StatusInternalServerError, "Parse template failed")
				}
			}
		default:
			return nil, intlib.NewError(http.StatusBadRequest, "Invalid inline section")
		}
	} else {
		if baseTemplate, routesData, err := intlib.WebsiteGetRoutesLayout(ctx, openid, websiteTemplate, iamCredential, authContextDirectoryGroupID); err != nil {
			n.logger.Log(ctx, slog.LevelError, intlib.FunctionNameAndError(n.ServiceGetStorageFilePageHtml, err).Error())
			return nil, intlib.NewError(http.StatusInternalServerError, "Parse template failed")
		} else {
			if err := websiteTemplate.WebsiteTemplateSetBaseTemplate(baseTemplate); err != nil {
				n.logger.Log(ctx, slog.LevelError, intlib.FunctionNameAndError(n.ServiceGetStorageFilePageHtml, err).Error())
				return nil, intlib.NewError(http.StatusInternalServerError, "Parse template failed")
			}
			data, err = intlibjson.SetValueInObject(data, fmt.Sprintf("%s.%s", intdoment.WEBSITE_PATH_ROUTES, intdoment.WEBSITE_PATH_KEY_DATA), routesData)
			if err != nil {
				n.logger.Log(ctx, slog.LevelError, intlib.FunctionNameAndError(n.ServiceGetStorageFilePageHtml, err).Error())
				return nil, intlib.NewError(http.StatusInternalServerError, http.StatusText(http.StatusInternalServerError))
			}
		}

		if err := websiteTemplate.WebsiteTemplateRegisterPartialFile(ctx, intdoment.WEBSITE_HTMLTMPL_ROUTES_GROUPID_LAYOUT, intdoment.WEBSITE_HTMLTMPL_PRTL_ROUTES); err != nil {
			n.logger.Log(ctx, slog.LevelError, intlib.FunctionNameAndError(n.ServiceGetStorageFilePageHtml, err).Error())
			return nil, intlib.NewError(http.StatusInternalServerError, "Parse template failed")
		}

		if err := websiteTemplate.WebsiteTemplateRegisterPartialFile(ctx, intdoment.WEBSITE_HTMLTMPL_ROUTES_GROUPID_STORAGE_FILES_ID_PAGE, intdoment.WEBSITE_HTMLTMPL_PRTL_ROUTESGROUPID); err != nil {
			n.logger.Log(ctx, slog.LevelError, intlib.FunctionNameAndError(n.ServiceGetStorageFilePageHtml, err).Error())
			return nil, intlib.NewError(http.StatusInternalServerError, "Parse template failed")
		}
	}

	if err := websiteTemplate.WebsiteTemplateRegisterPartialFile(ctx, intdoment.WEBSITE_HTMLTMPL_LIB_PAGES_ERROR, intdoment.WEBSITE_HTMLTMPL_PRTL_ERROR); err != nil {
		n.logger.Log(ctx, slog.LevelError, intlib.FunctionNameAndError(n.ServiceGetStorageFilePageHtml, err).Error())
		return nil, intlib.NewError(http.StatusInternalServerError, "Parse template failed")
	}

	if htmlContent, err := websiteTemplate.WebstieTemplateGetHtmlContext(ctx, data); err != nil {
		n.logger.Log(ctx, slog.LevelError, intlib.FunctionNameAndError(n.ServiceGetStorageFilePageHtml, err).Error())
		return nil, intlib.NewError(http.StatusInternalServerError, "Parse template failed")
	} else {
		return &htmlContent, nil
	}
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

func (n *service) ServiceStorageFilesSearch(
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
	if value, err := n.repo.RepoStorageFilesSearch(
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
		n.logger.Log(ctx, slog.LevelError, intlib.FunctionNameAndError(n.ServiceStorageFilesSearch, err).Error())
		return nil, intlib.NewError(http.StatusInternalServerError, http.StatusText(http.StatusInternalServerError))
	} else {
		return value, nil
	}
}

func (n *service) ServiceStorageFilesGetMetadataModel(ctx context.Context, metadataModelRetrieve intdomint.MetadataModelRetrieve, targetJoinDepth int) (map[string]any, error) {
	if value, err := metadataModelRetrieve.StorageFilesGetMetadataModel(ctx, 0, targetJoinDepth, nil); err != nil {
		n.logger.Log(ctx, slog.LevelWarn+1, intlib.FunctionNameAndError(n.ServiceStorageFilesGetMetadataModel, err).Error())
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

type service struct {
	repo   intdomint.RouteStorageFilesRepository
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
