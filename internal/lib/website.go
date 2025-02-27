package lib

import (
	"context"
	"encoding/json"
	"net/http"

	"slices"

	intdoment "github.com/icipe-official/Data-Abstraction-Platform/internal/domain/entities"
	intdomint "github.com/icipe-official/Data-Abstraction-Platform/internal/domain/interfaces"
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

func WebsiteGetRoutesLayout(ctx context.Context, openId intdomint.OpenID, websiteTemplate intdomint.WebsiteTemplates, iamCredential *intdoment.IamCredentials) (any, string, error) {
	template, err := websiteTemplate.WebsiteTemplateParseFile(ctx, intdoment.WEBSITE_HTMLTMPL_ROUTES_LAYOUT)
	if err != nil {
		return nil, "", err
	}

	sessionData := new(SessionData)
	sessionData.OpenidEndpoints.LoginEndpoint = openId.OpenIDGetLoginEndpoint()
	if openIdRegistrationEndpoint, err := openId.OpenIDGetRegistrationEndpoint(); err == nil {
		sessionData.OpenidEndpoints.RegistrationEndpoint = openIdRegistrationEndpoint
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

func WebsiteSendHTMLResponse(htmlContent *string, w http.ResponseWriter) {
	w.Header().Set("Cache-Control", "private, max-age=0")
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	w.Write([]byte(*htmlContent))
}

func WebsiteValidateHTMLPartialRequest(r *http.Request, partials []string) (bool, string) {
	if isPartial := r.URL.Query().Get("partial"); isPartial == "true" {
		if partialName := r.URL.Query().Get("partial_name"); partialName != "" {
			if slices.Contains(partials, partialName) {
				return true, partialName
			}
		}
	}
	return false, ""
}
