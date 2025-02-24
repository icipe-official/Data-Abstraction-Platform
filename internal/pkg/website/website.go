package website

import (
	"context"
	"encoding/json"
	"fmt"
	"log/slog"
	"net/http"

	"github.com/aymerick/raymond"
	intdoment "github.com/icipe-official/Data-Abstraction-Platform/internal/domain/entities"
	intpkglib "github.com/icipe-official/Data-Abstraction-Platform/internal/pkg/lib"
)

const (
	HTMLTMPL_LIB_PAGES_ERROR string = "lib/pages/error"

	HTMLTMPL_ROUTES_GROUPID_ABSTRACTIONS_ID_PAGE string = "routes/[group_id]/abstractions/[id]/page"
	HTMLTMPL_ROUTES_GROUPID_ABSTRACTIONS_PAGE    string = "routes/[group_id]/abstractions/page"

	HTMLTMPL_ROUTES_GROUPID_METADATAMODELS_ID_PAGE string = "routes/[group_id]/metadata-models/[id]/page"
	HTMLTMPL_ROUTES_GROUPID_METADATAMODELS_PAGE    string = "routes/[group_id]/metadata-models/page"

	HTMLTMPL_ROUTES_GROUPID_STORAGE_FILES_ID_PAGE string = "routes/[group_id]/storage/files/[id]/page"
	HTMLTMPL_ROUTES_GROUPID_STORAGE_FILES_PAGE    string = "routes/[group_id]/storage/files/page"

	HTMLTMPL_ROUTES_GROUPID_LAYOUT string = "routes/[group_id]/layout"
	HTMLTMPL_ROUTES_GROUPID_PAGE   string = "routes/[group_id]/page"

	HTMLTMPL_ROUTES_PAGE   string = "routes/page"
	HTMLTMPL_ROUTES_LAYOUT string = "routes/layout"

	HTMLTMPL_PRTL_ROUTES        string = "routes"
	HTMLTMPL_PRTL_ROUTESGROUPID string = "routesGroupid"
	HTMLTMPL_PRTL_ERROR         string = "error"
)

type WebsiteManifestEntry struct {
	File    string   `json:"file"`
	Name    string   `json:"name"`
	Src     string   `json:"src"`
	IsEntry bool     `json:"isEntry"`
	Imports []string `json:"imports"`
	Css     []string `json:"css"`
	Assets  []string `json:"assets"`
}

type HTMLErrorContext struct {
	Code    int
	Message string
}

type RoutesContext struct {
	Data  string
	Error HTMLErrorContext
}

type RoutesGroupidContext struct {
	RoutesContext
	Context struct {
		Error HTMLErrorContext
	}
}

func GetRoutesLayout(ctx context.Context, webService *intpkglib.WebService, iamCredential *intdoment.IamCredentials) (*raymond.Template, string, error) {
	template, err := GetTemplate(ctx, webService, HTMLTMPL_ROUTES_LAYOUT)
	if err != nil {
		return nil, "", err
	}

	sessionData := new(intpkglib.SessionData)
	sessionData.OpenidEndpoints.LoginEndpoint = webService.Env[intpkglib.ENV_OPENID_LOGIN_ENDPOINT]
	if len(webService.Env[intpkglib.ENV_OPENID_USER_REGISTRATION_ENDPOINT]) > 0 {
		sessionData.OpenidEndpoints.RegistrationEndpoint = webService.Env[intpkglib.ENV_OPENID_USER_REGISTRATION_ENDPOINT]
	}
	if iamCredential != nil {
		sessionData.IamCredential = iamCredential
	}

	if json, err := json.Marshal(sessionData); err != nil {
		return nil, "", err
	} else {
		return template, string(json), nil
	}
}

func SendHTMLResponse(htmlContent *string, w http.ResponseWriter) {
	w.Header().Set("Cache-Control", "private, max-age=0")
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	w.Write([]byte(*htmlContent))
}

func ValidateHTMLPartialRequest(r *http.Request, partials []string) (string, string) {
	if isPartial := r.URL.Query().Get("partial"); isPartial == "true" {
		if partialName := r.URL.Query().Get("partial_name"); partialName != "" {
			for _, s := range partials {
				if s == partialName {
					return isPartial, partialName
				}
			}
		}
	}
	return "", ""
}

func TemplateRegisterPartialFile(ctx context.Context, webService *intpkglib.WebService, template *raymond.Template, templateName string, partialName string) error {
	var err error

	if templateFilePath, ok := webService.HtmlPages[templateName]; ok {
		if err = template.RegisterPartialFile(webService.Env[intpkglib.ENV_WEBSITE_DIRECTORY]+templateFilePath, partialName); err != nil {
			err = fmt.Errorf("register template %v as partial with name %v failed | reason: %v", templateName, partialName, err)
			webService.Logger.Log(ctx, slog.LevelError, err.Error(), ctx.Value(intpkglib.LOG_ATTR_CTX_KEY))
			return err
		}
	} else {
		err = fmt.Errorf("get template property %v failed | reason: property does not exist", templateName)
		webService.Logger.Log(ctx, slog.LevelError, err.Error(), ctx.Value(intpkglib.LOG_ATTR_CTX_KEY))
		return err
	}
	return err
}

// GetTemplate fetches template file based on filePath relative to WEBSITE_DIRECTORY.
//
// The function logs the error using logAttributes if it encounters one during fetching of the template.
func GetTemplate(ctx context.Context, webService *intpkglib.WebService, templateName string) (*raymond.Template, error) {
	if templateFilePath, ok := webService.HtmlPages[templateName]; ok {
		if template, err := raymond.ParseFile(webService.Env[intpkglib.ENV_WEBSITE_DIRECTORY] + templateFilePath); err != nil {
			err = fmt.Errorf("get template %v failed, reason: %v", templateName, err)
			webService.Logger.Log(ctx, slog.LevelError, err.Error(), ctx.Value(intpkglib.LOG_ATTR_CTX_KEY))
			return nil, err
		} else {
			return template, nil
		}
	} else {
		err := fmt.Errorf("template property %v does not exist", templateName)
		webService.Logger.Log(ctx, slog.LevelError, err.Error(), ctx.Value(intpkglib.LOG_ATTR_CTX_KEY))
		return nil, err
	}
}
