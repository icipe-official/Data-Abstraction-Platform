package iam

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log/slog"
	"net/http"
	"net/url"
	"os"
	"slices"
	"strconv"
	"strings"

	intpkgiamopenid "github.com/icipe-official/Data-Abstraction-Platform/internal/pkg/iam/open_id"
	intpkglib "github.com/icipe-official/Data-Abstraction-Platform/internal/pkg/lib"
)

func AuthenticationMiddleware(webservice *intpkglib.WebService) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			next.ServeHTTP(w, r)
		})
	}
}

func GetTokenCookie(webService *intpkglib.WebService, token string, refreshTokenAge int) *http.Cookie {
	return &http.Cookie{
		Name:     webService.IamCookie.Name,
		Value:    token,
		MaxAge:   refreshTokenAge,
		HttpOnly: webService.IamCookie.HttpOnly,
		Secure:   webService.IamCookie.Secure,
		SameSite: webService.IamCookie.SameSite,
		Domain:   webService.IamCookie.Domain,
		Path:     webService.IamCookie.Path,
	}
}

func MaxifyAccessRefreshToken(webService *intpkglib.WebService, token string) (*AccessRefreshToken, error) {
	if webService.Env[intpkglib.ENV_IAM_ENCRYPT_TOKENS] != "false" {
		if decryptedData, err := intpkglib.DecryptData(webService.Env[intpkglib.ENV_IAM_ENCRYPTION_KEY], token); err != nil {
			return nil, fmt.Errorf("decrypt token failed, error: %v", err)
		} else {
			token = decryptedData
		}
	}

	var accessRefreshToken *AccessRefreshToken
	if decodedAccessRefreshToken, err := base64.StdEncoding.DecodeString(token); err != nil {
		return nil, fmt.Errorf("decode token failed, error: %v", err)
	} else {
		accessRefreshToken := new(AccessRefreshToken)
		if err := json.Unmarshal(decodedAccessRefreshToken, accessRefreshToken); err != nil {
			return nil, fmt.Errorf("convert token from json failed, error: %v", err)
		}
	}

	return accessRefreshToken, nil
}

func MinifyAccessRefreshToken(webService *intpkglib.WebService, token *intpkgiamopenid.Token) (string, error) {
	minAccessRefreshToken := ""

	if json, err := json.Marshal(
		AccessRefreshToken{
			AccessToken:  token.AccessToken,
			RefreshToken: token.RefreshToken,
		},
	); err != nil {
		return "", fmt.Errorf("convert clientToken to json failed, error: %v", err)
	} else {
		minAccessRefreshToken = base64.StdEncoding.EncodeToString(json)
	}

	if webService.Env[intpkglib.ENV_IAM_ENCRYPT_TOKENS] != "false" {
		if encryptedData, err := intpkglib.EncryptData(webService.Env[intpkglib.ENV_IAM_ENCRYPTION_KEY], []byte(minAccessRefreshToken)); err != nil {
			return "", fmt.Errorf("encrypt minAccessRefreshToken failed, error: %v", err)
		} else {
			minAccessRefreshToken = encryptedData
		}
	}

	return minAccessRefreshToken, nil
}

type AccessRefreshToken struct {
	AccessToken  string `json:"access_token,omitempty"`
	RefreshToken string `json:"refresh_token,omitempty"`
}

func OpenIDRevokeToken(webService *intpkglib.WebService, token *intpkgiamopenid.Token) error {
	if len(token.RefreshToken) == 0 || len(token.AccessToken) == 0 {
		return errors.New("token.RefreshToken and token.AccessToken is empty")
	}

	if len(token.AccessToken) > 0 {
		data := url.Values{}
		data.Set("token", token.AccessToken)
		data.Set("token_type_hint", "access_token")

		request, err := http.NewRequest(http.MethodPost, webService.OpenIDConfig.RevocationEndpoint, strings.NewReader(data.Encode()))
		if err != nil {
			return fmt.Errorf("create new http request failed, error: %v", err)
		}
		request.Header.Add("Content-Type", "application/x-www-form-urlencoded")
		request.Header.Add("Authorization", fmt.Sprintf("Basic %s", base64.StdEncoding.EncodeToString([]byte(webService.Env[intpkglib.ENV_OPENID_CLIENT_ID]+":"+webService.Env[intpkglib.ENV_OPENID_CLIENT_SECRET]))))
		response, err := http.DefaultClient.Do(request)
		if err != nil {
			return fmt.Errorf("execute http request failed, error: %v", err)
		}

		if response.StatusCode != http.StatusOK {
			defer response.Body.Close()
			body, _ := io.ReadAll(response.Body)
			return fmt.Errorf("request error: StatusCode: %d; Status: %s; Body: %s", response.StatusCode, response.Status, string(body))
		}
	}

	if len(token.RefreshToken) > 0 {
		data := url.Values{}
		data.Set("token", token.RefreshToken)
		data.Set("token_type_hint", "refresh_token")

		request, err := http.NewRequest(http.MethodPost, webService.OpenIDConfig.RevocationEndpoint, strings.NewReader(data.Encode()))
		if err != nil {
			return fmt.Errorf("create new http request failed, error: %v", err)
		}
		request.Header.Add("Content-Type", "application/x-www-form-urlencoded")
		request.Header.Add("Authorization", fmt.Sprintf("Basic %s", base64.StdEncoding.EncodeToString([]byte(webService.Env[intpkglib.ENV_OPENID_CLIENT_ID]+":"+webService.Env[intpkglib.ENV_OPENID_CLIENT_SECRET]))))
		response, err := http.DefaultClient.Do(request)
		if err != nil {
			return fmt.Errorf("execute http request failed, error: %v", err)
		}

		if response.StatusCode != http.StatusOK {
			defer response.Body.Close()
			body, _ := io.ReadAll(response.Body)
			return fmt.Errorf("request error: StatusCode: %d; Status: %s; Body: %s", response.StatusCode, response.Status, string(body))
		}
	}

	return nil
}

func OpenIDRefreshToken(webService *intpkglib.WebService, token *intpkgiamopenid.Token) (*intpkgiamopenid.Token, error) {
	newToken := new(intpkgiamopenid.Token)

	if len(token.RefreshToken) == 0 {
		return nil, errors.New("token.RefreshToken is empty")
	}

	data := url.Values{}
	data.Set("client_id", webService.Env[intpkglib.ENV_OPENID_CLIENT_ID])
	data.Set("client_secret", webService.Env[intpkglib.ENV_OPENID_CLIENT_SECRET])
	data.Set("grant_type", intpkgiamopenid.GRANT_TYPE_REFRESH_TOKEN)
	data.Set("refresh_token", token.RefreshToken)

	request, err := http.NewRequest(http.MethodPost, webService.OpenIDConfig.TokenEndpoint, strings.NewReader(data.Encode()))
	if err != nil {
		return nil, fmt.Errorf("create new http request failed, error: %v", err)
	}
	request.Header.Add("Content-Type", "application/x-www-form-urlencoded")
	response, err := http.DefaultClient.Do(request)
	if err != nil {
		return nil, fmt.Errorf("execute http request failed, error: %v", err)
	}
	defer response.Body.Close()
	body, err := io.ReadAll(response.Body)
	if err != nil {
		return nil, fmt.Errorf("read body failed, error: %v", err)
	}

	if response.StatusCode == http.StatusOK {
		if err := json.Unmarshal(body, newToken); err != nil {
			return nil, fmt.Errorf("read body in json failed, error: %v", err)
		}
	} else {
		return nil, fmt.Errorf("request error: StatusCode: %d; Status: %s; Body: %s", response.StatusCode, response.Status, string(body))
	}

	return newToken, nil
}

func OpenIDGetUserinfo(webService *intpkglib.WebService, token *intpkgiamopenid.Token) (*intpkgiamopenid.UserInfo, error) {
	userInfo := new(intpkgiamopenid.UserInfo)

	if len(token.AccessToken) == 0 {
		return nil, errors.New("token.AccessToken is empty")
	}

	request, err := http.NewRequest(http.MethodGet, webService.OpenIDConfig.UserinfoEndpoint, nil)
	if err != nil {
		return nil, fmt.Errorf("create new http request failed, error: %v", err)
	}
	request.Header.Add("Authorization", fmt.Sprintf("Bearer %s", token.AccessToken))
	response, err := http.DefaultClient.Do(request)
	if err != nil {
		return nil, fmt.Errorf("execute http request failed, error: %v", err)
	}
	defer response.Body.Close()
	body, err := io.ReadAll(response.Body)
	if err != nil {
		return nil, fmt.Errorf("read body failed, error: %v", err)
	}

	if response.StatusCode == http.StatusOK {
		if err := json.Unmarshal(body, userInfo); err != nil {
			return nil, fmt.Errorf("read body in json failed, error: %v", err)
		}
	} else {
		return nil, fmt.Errorf("request error: StatusCode: %d; Status: %s; Body: %s", response.StatusCode, response.Status, string(body))
	}

	return userInfo, nil
}

func OpenIDIntrospectToken(webService *intpkglib.WebService, token *intpkgiamopenid.Token) (*intpkgiamopenid.TokenIntrospect, error) {
	tokenIntrospect := new(intpkgiamopenid.TokenIntrospect)

	if len(token.AccessToken) == 0 {
		return nil, errors.New("token.AccessToken is empty")
	}

	data := url.Values{}
	data.Set("token", token.AccessToken)
	data.Set("client_id", webService.Env[intpkglib.ENV_OPENID_CLIENT_ID])
	data.Set("client_secret", webService.Env[intpkglib.ENV_OPENID_CLIENT_SECRET])

	request, err := http.NewRequest(http.MethodPost, webService.OpenIDConfig.TokenIntrospectionEndpoint, strings.NewReader(data.Encode()))
	if err != nil {
		return nil, fmt.Errorf("create new http request failed, error: %v", err)
	}
	request.Header.Add("Content-Type", "application/x-www-form-urlencoded")
	response, err := http.DefaultClient.Do(request)
	if err != nil {
		return nil, fmt.Errorf("execute http request failed, error: %v", err)
	}
	defer response.Body.Close()
	body, err := io.ReadAll(response.Body)
	if err != nil {
		return nil, fmt.Errorf("read body failed, error: %v", err)
	}

	if response.StatusCode == http.StatusOK {
		if err := json.Unmarshal(body, tokenIntrospect); err != nil {
			return nil, fmt.Errorf("read body in json failed, error: %v", err)
		}
	} else {
		return nil, fmt.Errorf("request error: StatusCode: %d; Status: %s; Body: %s", response.StatusCode, response.Status, string(body))
	}

	return tokenIntrospect, nil
}

func OpenIDGetTokenFromRedirect(webService *intpkglib.WebService, redirectParams *intpkgiamopenid.RedirectParams) (*intpkgiamopenid.Token, error) {
	token := new(intpkgiamopenid.Token)

	data := url.Values{}
	data.Set("grant_type", intpkgiamopenid.GRANT_TYPE_AUTHORIZATION_CODE)
	data.Set("client_id", webService.Env[intpkglib.ENV_OPENID_CLIENT_ID])
	data.Set("client_secret", webService.Env[intpkglib.ENV_OPENID_CLIENT_SECRET])
	data.Set("code", redirectParams.Code)
	data.Set("redirect_uri", webService.Env[intpkglib.ENV_OPENID_LOGIN_REDIRECT_URL])

	request, err := http.NewRequest(http.MethodPost, webService.OpenIDConfig.TokenEndpoint, strings.NewReader(data.Encode()))
	if err != nil {
		return nil, fmt.Errorf("create new http request failed, error: %v", err)
	}
	request.Header.Add("Content-Type", "application/x-www-form-urlencoded")
	response, err := http.DefaultClient.Do(request)
	if err != nil {
		return nil, fmt.Errorf("execute http request failed, error: %v", err)
	}
	defer response.Body.Close()
	body, err := io.ReadAll(response.Body)
	if err != nil {
		return nil, fmt.Errorf("read body failed, error: %v", err)
	}

	if response.StatusCode == http.StatusOK {
		if err := json.Unmarshal(body, token); err != nil {
			return nil, fmt.Errorf("read body in json failed, error: %v", err)
		}
	} else {
		return nil, fmt.Errorf("request error: StatusCode: %d; Status: %s; Body: %s", response.StatusCode, response.Status, string(body))
	}

	return token, nil
}

func SetupIamEnvironment(webService *intpkglib.WebService, logAttribute slog.Attr) error {
	webService.Env[intpkglib.ENV_IAM_ENCRYPT_TOKENS] = os.Getenv(intpkglib.ENV_IAM_ENCRYPT_TOKENS)
	if webService.Env[intpkglib.ENV_IAM_ENCRYPT_TOKENS] != "false" {
		// Validate IAM_ENCRYPTION_KEY
		webService.Logger.Log(context.TODO(), slog.Level(2), "Validating IAM_ENCRYPTION_KEY...", logAttribute)
		iekLength := len(os.Getenv("IAM_ENCRYPTION_KEY"))
		if iekLength != 16 && iekLength != 24 && iekLength != 32 {
			return fmt.Errorf("env variable IAM_ENCRYPTION_KEY can only be 16, 24, or 32 characters in length ONLY")
		}
		webService.Env[intpkglib.ENV_IAM_ENCRYPTION_KEY] = os.Getenv(intpkglib.ENV_IAM_ENCRYPTION_KEY)
	}

	// Verify and set openid configuration
	webService.Logger.Log(context.TODO(), slog.Level(2), "Validating and Setting up openid configuration...", logAttribute)
	if err := ValidateAndSetOpenIDConfiguration(webService); err != nil {
		return fmt.Errorf("validate and setup OpenID config failed, error: %v", err)
	}

	// Setup IamCookie
	webService.IamCookie = http.Cookie{}
	if cookieName := os.Getenv("IAM_COOKIE_NAME"); len(cookieName) > 0 {
		webService.IamCookie.Name = cookieName
	} else {
		webService.IamCookie.Name = "dap"
	}
	if os.Getenv("IAM_COOKIE_HTTP_ONLY") == "true" {
		webService.IamCookie.HttpOnly = true
	} else {
		webService.IamCookie.HttpOnly = false
	}
	if os.Getenv("IAM_COOKIE_SECURE") == "true" {
		webService.IamCookie.Secure = true
	} else {
		webService.IamCookie.Secure = false
	}
	if sameSite, err := strconv.Atoi(os.Getenv("IAM_COOKIE_SAME_SITE")); err != nil {
		webService.IamCookie.SameSite = http.SameSite(http.SameSiteStrictMode)
	} else {
		webService.IamCookie.SameSite = http.SameSite(sameSite)
	}
	webService.IamCookie.Domain = os.Getenv("IAM_COOKIE_DOMAIN")
	webService.IamCookie.Path = webService.Env[intpkglib.ENV_WEB_SERVICE_BASE_PATH]

	return nil
}

func ValidateAndSetOpenIDConfiguration(webService *intpkglib.WebService) error {

	request, err := http.NewRequest(http.MethodGet, os.Getenv("OPENID_CONFIGURATION_ENDPOINT"), nil)
	if err != nil {
		return fmt.Errorf("create new http request failed, error: %v", err)
	}
	response, err := http.DefaultClient.Do(request)
	if err != nil {
		return fmt.Errorf("execute http request failed, error: %v", err)
	}

	if response.StatusCode != http.StatusOK {
		return fmt.Errorf("request not OK. http status code: %d; http status: %s", response.StatusCode, response.Status)
	}

	webService.OpenIDConfig = new(intpkgiamopenid.Configuration)
	defer response.Body.Close()
	body, err := io.ReadAll(response.Body)
	if err != nil {
		return fmt.Errorf("read body failed, error: %v", err)
	}
	if err := json.Unmarshal(body, webService.OpenIDConfig); err != nil {
		return fmt.Errorf("read body in json failed, error: %v", err)
	}

	if len(webService.OpenIDConfig.Issuer) == 0 {
		return errors.New("OpenIDConfig.Issuer is nil")
	}

	if len(webService.OpenIDConfig.AuthorizationEndpoint) == 0 {
		return errors.New("OpenIDConfig.AuthorizationEndpoint is nil")
	}

	if len(webService.OpenIDConfig.TokenEndpoint) == 0 {
		return errors.New("OpenIDConfig.TokenEndpoint is nil")
	}

	if len(webService.OpenIDConfig.TokenIntrospectionEndpoint) == 0 {
		return errors.New("OpenIDConfig.TokenIntrospectionEndpoint is nil")
	}

	if len(webService.OpenIDConfig.UserinfoEndpoint) == 0 {
		return errors.New("OpenIDConfig.UserinfoEndpoint is nil")
	}

	if len(webService.OpenIDConfig.RevocationEndpoint) == 0 {
		return errors.New("OpenIDConfig.UserinfoEndpoint is nil")
	}

	if len(webService.OpenIDConfig.GrantTypesSupported) < 2 {
		return errors.New("not enough OpenIDConfig.GrantTypesSupported supported")
	} else {
		if !slices.Contains(webService.OpenIDConfig.GrantTypesSupported, intpkgiamopenid.GRANT_TYPE_AUTHORIZATION_CODE) {
			return fmt.Errorf("OpenIDConfig.GrantTypesSupported type '%s' not supported", intpkgiamopenid.GRANT_TYPE_AUTHORIZATION_CODE)
		}

		if !slices.Contains(webService.OpenIDConfig.GrantTypesSupported, intpkgiamopenid.GRANT_TYPE_REFRESH_TOKEN) {
			return fmt.Errorf("OpenIDConfig.GrantTypesSupported type '%s' not supported", intpkgiamopenid.GRANT_TYPE_REFRESH_TOKEN)
		}

		if !slices.Contains(webService.OpenIDConfig.GrantTypesSupported, intpkgiamopenid.GRANT_TYPE_REFRESH_TOKEN) {
			webService.Logger.Log(context.TODO(), slog.LevelWarn, fmt.Sprintf("OpenIDConfig.GrantTypesSupported type '%s' not supported, Direct token retrieval from openid server not available", intpkgiamopenid.GRANT_TYPE_PASSWORD))
		}
	}

	if len(webService.OpenIDConfig.ResponseTypesSupported) == 0 {
		return errors.New("not enough OpenIDConfig.ResponseTypesSupported supported")
	} else {
		if !slices.Contains(webService.OpenIDConfig.ResponseTypesSupported, intpkgiamopenid.RESPONSE_TYPE_CODE) {
			return fmt.Errorf("OpenIDConfig.ResponseTypesSupported type '%s' not supported", intpkgiamopenid.RESPONSE_TYPE_CODE)
		}
	}

	webService.Env[intpkglib.ENV_OPENID_CLIENT_ID] = os.Getenv(intpkglib.ENV_OPENID_CLIENT_ID)
	webService.Env[intpkglib.ENV_OPENID_CLIENT_SECRET] = os.Getenv(intpkglib.ENV_OPENID_CLIENT_SECRET)
	webService.Env[intpkglib.ENV_OPENID_USER_REGISTRATION_ENDPOINT] = os.Getenv(intpkglib.ENV_OPENID_USER_REGISTRATION_ENDPOINT)
	if err := setLoginEndpointUrlAndLoginRedirectUrl(webService); err != nil {
		return fmt.Errorf("generate login endpoint failed, error: %v", err)
	}

	return nil
}

func setLoginEndpointUrlAndLoginRedirectUrl(webService *intpkglib.WebService) error {
	loginRedirectUrl := new(url.URL)
	if url, err := url.Parse(webService.Env[intpkglib.ENV_WEBSITE_BASE_URL]); err != nil {
		return fmt.Errorf("ENV_WEBSITE_BASE_URL not valid, error: %v", err)
	} else {
		loginRedirectUrl = url
	}
	loginRedirectUrl.Path += webService.Env[intpkglib.ENV_WEB_SERVICE_BASE_PATH]
	loginRedirectUrl.Path += "redirect/login"

	webService.Env[intpkglib.ENV_OPENID_LOGIN_REDIRECT_URL] = loginRedirectUrl.String()

	loginEndpointUrl := new(url.URL)
	if url, err := url.Parse(webService.OpenIDConfig.AuthorizationEndpoint); err != nil {
		return err
	} else {
		loginEndpointUrl = url
	}

	params := url.Values{}
	params.Add("scope", "openid")
	params.Add("response_type", "code")
	params.Add("client_id", webService.Env[intpkglib.ENV_OPENID_CLIENT_ID])
	params.Add("redirect_uri", loginRedirectUrl.String())
	loginEndpointUrl.RawQuery = params.Encode()

	webService.Env[intpkglib.ENV_OPENID_LOGIN_ENDPOINT] = loginEndpointUrl.String()

	return nil
}
