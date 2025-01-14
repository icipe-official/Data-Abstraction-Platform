package home

import (
	"fmt"
	"log/slog"
	"net/http"
	"strings"
	"time"

	"github.com/aymerick/raymond"
	"github.com/gofrs/uuid/v5"
	intpkgdatabasemodels "github.com/icipe-official/Data-Abstraction-Platform/internal/pkg/database/models"
	intpkgiam "github.com/icipe-official/Data-Abstraction-Platform/internal/pkg/iam"
	intpkglib "github.com/icipe-official/Data-Abstraction-Platform/internal/pkg/lib"
	intpkgutils "github.com/icipe-official/Data-Abstraction-Platform/internal/pkg/utils"
	intpkgwebsite "github.com/icipe-official/Data-Abstraction-Platform/internal/pkg/website"
	"github.com/jackc/pgx/v5"
)

// Performs the following tasks:
//
// 1. Set n.OpenidToken and n.OpenidUserInfo
//
// 2. Set n.IamCredential.ID by getting intpkgdatabasemodels.IamCredentialsTable().TableName using n.OpenidUserInfo.Sub.
// If intpkgdatabasemodels.IamCredentialsTable().TableName does not exist, create a new one with n.OpenidUserInfo.
func (n *requestResponseContextData) GetOpenidTokenAndUserInfoAndIamCredentialID() error {
	if token, err := intpkgiam.OpenIDGetTokenFromRedirect(n.WebService, n.RedirectData); err != nil {
		n.WebService.Logger.Log(n.Context, slog.LevelError, fmt.Sprintf("get openid token failed, error: %v", err), n.Context.Value(intpkglib.LOG_ATTR_CTX_KEY))
		return intpkgutils.NewError(http.StatusInternalServerError, http.StatusText(http.StatusInternalServerError))
	} else {
		n.OpenidToken = token
	}

	if userInfo, err := intpkgiam.OpenIDGetUserinfo(n.WebService, n.OpenidToken); err != nil {
		n.WebService.Logger.Log(n.Context, slog.LevelError, fmt.Sprintf("get openid user info failed, error: %v", err), n.Context.Value(intpkglib.LOG_ATTR_CTX_KEY))
		return intpkgutils.NewError(http.StatusInternalServerError, http.StatusText(http.StatusInternalServerError))
	} else {
		n.OpenidUserInfo = userInfo
	}

	query := fmt.Sprintf(
		"SELECT %[1]s , %[2]s FROM %[3]s WHERE %[4]s = $1;",
		intpkgdatabasemodels.IamCredentialsTable().ID,            //1
		intpkgdatabasemodels.IamCredentialsTable().DeactivatedOn, //2
		intpkgdatabasemodels.IamCredentialsTable().TableName,     //3
		intpkgdatabasemodels.IamCredentialsTable().OpenidSub,     //4
	)
	n.WebService.Logger.Log(n.Context, slog.LevelDebug, query, n.Context.Value(intpkglib.LOG_ATTR_CTX_KEY))
	n.IamCredential = new(intpkgdatabasemodels.IamCredentials)
	n.IamCredential.ID = make([]uuid.UUID, 1)
	n.IamCredential.DeactivatedOn = make([]time.Time, 1)

	if err := n.WebService.PgxPool.QueryRow(n.Context, query, n.OpenidUserInfo.Sub).Scan(&n.IamCredential.ID[0], &n.IamCredential.DeactivatedOn[0]); err != nil {
		if err != pgx.ErrNoRows {
			n.WebService.Logger.Log(n.Context, slog.LevelError, fmt.Sprintf("get %s using OpenidUserInfo.Sub failed, error: %v", intpkgdatabasemodels.IamCredentialsTable().TableName, err), n.Context.Value(intpkglib.LOG_ATTR_CTX_KEY))
			if err := intpkgiam.OpenIDRevokeToken(n.WebService, n.OpenidToken); err != nil {
				n.WebService.Logger.Log(n.Context, slog.LevelError, fmt.Sprintf("Revoke openid token failed, error: %v", err), n.Context.Value(intpkglib.LOG_ATTR_CTX_KEY))
			}
			return intpkgutils.NewError(http.StatusInternalServerError, http.StatusText(http.StatusInternalServerError))
		} else {
			// Create New intpkgdatabasemodels.IamCredentialsTable().TableName using n.OpenidUserInfo
			columnsToInsert := make([]string, 0)
			valuesToInsert := make([]any, 0)
			if n.OpenidUserInfo.Sub.IsNil() {
				n.WebService.Logger.Log(n.Context, slog.LevelError, "OpenidUserInfo.Sub is empty", n.Context.Value(intpkglib.LOG_ATTR_CTX_KEY))
				if err := intpkgiam.OpenIDRevokeToken(n.WebService, n.OpenidToken); err != nil {
					n.WebService.Logger.Log(n.Context, slog.LevelError, fmt.Sprintf("Revoke openid token failed, error: %v", err), n.Context.Value(intpkglib.LOG_ATTR_CTX_KEY))
				}
				return intpkgutils.NewError(http.StatusBadRequest, http.StatusText(http.StatusBadRequest))
			} else {
				columnsToInsert = append(columnsToInsert, intpkgdatabasemodels.IamCredentialsTable().OpenidSub)
				valuesToInsert = append(valuesToInsert, n.OpenidUserInfo.Sub)
			}

			if len(n.OpenidUserInfo.PreferredUsername) == 0 {
				n.WebService.Logger.Log(n.Context, slog.LevelError, "OpenidUserInfo.PreferredUsername is empty", n.Context.Value(intpkglib.LOG_ATTR_CTX_KEY))
				if err := intpkgiam.OpenIDRevokeToken(n.WebService, n.OpenidToken); err != nil {
					n.WebService.Logger.Log(n.Context, slog.LevelError, fmt.Sprintf("Revoke openid token failed, error: %v", err), n.Context.Value(intpkglib.LOG_ATTR_CTX_KEY))
				}
				return intpkgutils.NewError(http.StatusBadRequest, http.StatusText(http.StatusBadRequest))
			} else {
				columnsToInsert = append(columnsToInsert, intpkgdatabasemodels.IamCredentialsTable().OpenidPreferredUsername)
				valuesToInsert = append(valuesToInsert, n.OpenidUserInfo.PreferredUsername)
			}

			if len(n.OpenidUserInfo.Email) == 0 {
				n.WebService.Logger.Log(n.Context, slog.LevelError, "OpenidUserInfo.Email is empty", n.Context.Value(intpkglib.LOG_ATTR_CTX_KEY))
				if err := intpkgiam.OpenIDRevokeToken(n.WebService, n.OpenidToken); err != nil {
					n.WebService.Logger.Log(n.Context, slog.LevelError, fmt.Sprintf("Revoke openid token failed, error: %v", err), n.Context.Value(intpkglib.LOG_ATTR_CTX_KEY))
				}
				return intpkgutils.NewError(http.StatusBadRequest, http.StatusText(http.StatusBadRequest))
			} else {
				columnsToInsert = append(columnsToInsert, intpkgdatabasemodels.IamCredentialsTable().OpenidEmail)
				valuesToInsert = append(valuesToInsert, n.OpenidUserInfo.Email)
			}

			columnsToInsert = append(columnsToInsert, intpkgdatabasemodels.IamCredentialsTable().OpenidEmailVerified)
			valuesToInsert = append(valuesToInsert, n.OpenidUserInfo.EmailVerified)

			if len(n.OpenidUserInfo.GivenName) > 0 {
				columnsToInsert = append(columnsToInsert, intpkgdatabasemodels.IamCredentialsTable().OpenidGivenName)
				valuesToInsert = append(valuesToInsert, n.OpenidUserInfo.GivenName)
			}

			if len(n.OpenidUserInfo.FamilyName) > 0 {
				columnsToInsert = append(columnsToInsert, intpkgdatabasemodels.IamCredentialsTable().OpenidFamilyName)
				valuesToInsert = append(valuesToInsert, n.OpenidUserInfo.FamilyName)
			}

			query := fmt.Sprintf(
				"INSERT INTO %[1]s (%[2]s) VALUES (%[3]s) RETURNING %[4]s;",
				intpkgdatabasemodels.IamCredentialsTable().TableName,                             //1
				strings.Join(columnsToInsert, " , "),                                             //2
				intpkgutils.PostgresGetQueryPlaceholderString(len(valuesToInsert), &[]int{1}[0]), //3
				intpkgdatabasemodels.IamCredentialsTable().ID,                                    //4
			)
			n.WebService.Logger.Log(n.Context, slog.LevelDebug, query, n.Context.Value(intpkglib.LOG_ATTR_CTX_KEY))
			if err := n.WebService.PgxPool.QueryRow(n.Context, query, valuesToInsert...).Scan(&n.IamCredential.ID[0]); err != nil {
				n.WebService.Logger.Log(n.Context, slog.LevelError, fmt.Sprintf("create new %s using OpenidUserInfo failed, error: %v", intpkgdatabasemodels.IamCredentialsTable().TableName, err), n.Context.Value(intpkglib.LOG_ATTR_CTX_KEY))
				if err := intpkgiam.OpenIDRevokeToken(n.WebService, n.OpenidToken); err != nil {
					n.WebService.Logger.Log(n.Context, slog.LevelError, fmt.Sprintf("Revoke openid token failed, error: %v", err), n.Context.Value(intpkglib.LOG_ATTR_CTX_KEY))
				}
				return intpkgutils.NewError(http.StatusInternalServerError, http.StatusText(http.StatusInternalServerError))
			}
		}
	} else {
		if !n.IamCredential.DeactivatedOn[0].IsZero() {
			return intpkgutils.NewError(http.StatusForbidden, http.StatusText(http.StatusForbidden))
		}
	}

	return nil
}

func (n *requestResponseContextData) GetHomePage() error {
	var template *raymond.Template
	var err error

	if n.HTMLIsPartialRequest == "true" {
		switch n.HTMLPartialName {
		case intpkgwebsite.HTMLTMPL_PRTL_ROUTES:
			template, err = intpkgwebsite.GetTemplate(n.Context, n.WebService, intpkgwebsite.HTMLTMPL_ROUTES_PAGE)
			if err != nil {
				return intpkgutils.NewError(http.StatusInternalServerError, "Parse template failed")
			}
		default:
			return intpkgutils.NewError(http.StatusInternalServerError, "Invalid inline section")
		}
	} else {
		template, n.HTMLHomePageContext.Data, err = intpkgwebsite.GetRoutesLayout(n.Context, n.WebService, nil)
		if err != nil {
			return intpkgutils.NewError(http.StatusInternalServerError, "Parse template failed")
		}

		if err = intpkgwebsite.TemplateRegisterPartialFile(n.Context, n.WebService, template, intpkgwebsite.HTMLTMPL_ROUTES_PAGE, intpkgwebsite.HTMLTMPL_PRTL_ROUTES); err != nil {
			return intpkgutils.NewError(http.StatusInternalServerError, "Parse template failed")
		}
	}

	if err = intpkgwebsite.TemplateRegisterPartialFile(n.Context, n.WebService, template, intpkgwebsite.HTMLTMPL_LIB_PAGES_ERROR, intpkgwebsite.HTMLTMPL_PRTL_ERROR); err != nil {
		return intpkgutils.NewError(http.StatusInternalServerError, "Parse template failed")
	}

	if n.HTMLContent, err = template.Exec(n.HTMLHomePageContext); err != nil {
		n.WebService.Logger.Log(n.Context, slog.LevelError, fmt.Sprintf("evaluate template failed, error: %v", err), n.Context.Value(intpkglib.LOG_ATTR_CTX_KEY))
		return intpkgutils.NewError(http.StatusInternalServerError, "Parse template failed")
	}

	return nil
}
