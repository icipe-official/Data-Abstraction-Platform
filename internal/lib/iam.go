package lib

import (
	"context"
	"encoding/base64"
	"fmt"
	"log/slog"
	"net/http"
	"os"
	"strconv"
	"strings"

	intdoment "github.com/icipe-official/Data-Abstraction-Platform/internal/domain/entities"
	intdomint "github.com/icipe-official/Data-Abstraction-Platform/internal/domain/interfaces"
)

func IamAuthenticationMiddleware(logger intdomint.Logger, env *EnvVariables, openId intdomint.OpenID, iamCookie http.Cookie, repo intdomint.IamRepository) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			openIDToken := new(intdoment.OpenIDToken)
			if encryptedCookie, err := r.Cookie(IamCookieGetAccessTokenName(iamCookie.Name)); err == nil {
				token := ""
				if env.Get(ENV_IAM_ENCRYPT_TOKENS) != "false" {
					if decrypted, err := DecryptData(env.Get(ENV_IAM_ENCRYPTION_KEY), encryptedCookie.Value); err != nil {
						logger.Log(r.Context(), slog.LevelWarn, fmt.Sprintf("decrypt access token failed, error: %v", err))
					} else {
						token = decrypted
					}
				} else {
					token = encryptedCookie.Value
				}

				if len(token) > 0 {
					if tokenBytes, err := base64.StdEncoding.DecodeString(token); err != nil {
						logger.Log(r.Context(), slog.LevelError, fmt.Sprintf("decode access token failed, error: %v", err))
						next.ServeHTTP(w, r.WithContext(context.WithValue(r.Context(), ERROR_CODE_CTX_KEY, NewError(http.StatusUnauthorized, http.StatusText(http.StatusUnauthorized)))))
						return
					} else {
						openIDToken.AccessToken = string(tokenBytes)
					}
				}
			}

			if encryptedCookie, err := r.Cookie(IamCookieGetRefreshTokenName(iamCookie.Name)); err == nil {
				token := encryptedCookie.Value
				if env.Get(ENV_IAM_ENCRYPT_TOKENS) != "false" {
					if decrypted, err := DecryptData(env.Get(ENV_IAM_ENCRYPTION_KEY), token); err != nil {
						logger.Log(r.Context(), slog.LevelError, fmt.Sprintf("decrypt refresh token failed, error: %v", err))
						next.ServeHTTP(w, r.WithContext(context.WithValue(r.Context(), ERROR_CODE_CTX_KEY, NewError(http.StatusUnauthorized, http.StatusText(http.StatusUnauthorized)))))
						return
					} else {
						token = decrypted
					}
				}
				if tokenBytes, err := base64.StdEncoding.DecodeString(token); err != nil {
					logger.Log(r.Context(), slog.LevelError, fmt.Sprintf("decode refresh token failed, error: %v", err))
					next.ServeHTTP(w, r.WithContext(context.WithValue(r.Context(), ERROR_CODE_CTX_KEY, NewError(http.StatusUnauthorized, http.StatusText(http.StatusUnauthorized)))))
					return
				} else {
					openIDToken.RefreshToken = string(tokenBytes)
				}
			}

			openIDTokenIntrospect := new(intdoment.OpenIDTokenIntrospect)
			if value, err := openId.OpenIDIntrospectToken(openIDToken); err != nil {
				logger.Log(r.Context(), slog.LevelWarn+1, fmt.Sprintf("introspect open id token failed, error: %v", err))
				if strings.HasPrefix(r.URL.Path, fmt.Sprintf("%sapi/iam/logout", env.Get(ENV_WEB_SERVICE_BASE_PATH))) {
					next.ServeHTTP(w, r.WithContext(context.WithValue(r.Context(), ERROR_CODE_CTX_KEY, NewError(http.StatusBadRequest, http.StatusText(http.StatusBadRequest)))))
					return
				}
				if newToken, err := openId.OpenIDRefreshToken(openIDToken); err != nil {
					logger.Log(r.Context(), slog.LevelError, fmt.Sprintf("refresh open id token failed, error: %v", err))
					next.ServeHTTP(w, r.WithContext(context.WithValue(r.Context(), ERROR_CODE_CTX_KEY, NewError(http.StatusUnauthorized, http.StatusText(http.StatusUnauthorized)))))
					return
				} else {
					openIDToken = newToken
					if nvalue, err := openId.OpenIDIntrospectToken(openIDToken); err != nil {
						logger.Log(r.Context(), slog.LevelError, fmt.Sprintf("introspect open id token after refresh failed, error: %v", err))
						next.ServeHTTP(w, r.WithContext(context.WithValue(r.Context(), ERROR_CODE_CTX_KEY, NewError(http.StatusUnauthorized, http.StatusText(http.StatusUnauthorized)))))
						return
					} else {
						if token, err := IamPrepOpenIDTokenForClient(env, openIDToken); err != nil {
							logger.Log(r.Context(), slog.LevelError, fmt.Sprintf("Prepare access refresh token for client failed, error: %v", err))
							if err := openId.OpenIDRevokeToken(openIDToken); err != nil {
								logger.Log(r.Context(), slog.LevelError, fmt.Sprintf("Revoke access refresh token for client failed, error: %v", err))
							}
							next.ServeHTTP(w, r.WithContext(context.WithValue(r.Context(), ERROR_CODE_CTX_KEY, NewError(http.StatusUnauthorized, http.StatusText(http.StatusUnauthorized)))))
							return
						} else {
							IamSetCookieInResponse(w, iamCookie, token, int(openIDToken.ExpiresIn), int(openIDToken.RefreshExpiresIn))
						}
						openIDTokenIntrospect = nvalue
					}
				}
			} else {
				openIDTokenIntrospect = value
			}

			iamCredentials, err := repo.RepoIamCredentialsFindOneByID(r.Context(), intdoment.IamCredentialsRepository().OpenidSub, openIDTokenIntrospect.Sub, nil)
			if err != nil {
				logger.Log(r.Context(), slog.LevelError, fmt.Sprintf("introspect open id token after refresh failed, error: %v", err))
				next.ServeHTTP(w, r.WithContext(context.WithValue(r.Context(), ERROR_CODE_CTX_KEY, NewError(http.StatusInternalServerError, http.StatusText(http.StatusInternalServerError)))))
				return
			}
			if iamCredentials == nil {
				next.ServeHTTP(w, r.WithContext(context.WithValue(r.Context(), ERROR_CODE_CTX_KEY, NewError(http.StatusUnauthorized, http.StatusText(http.StatusUnauthorized)))))
				return
			}
			if len(iamCredentials.DeactivatedOn) == 1 && !iamCredentials.DeactivatedOn[0].IsZero() {
				next.ServeHTTP(w, r.WithContext(context.WithValue(r.Context(), ERROR_CODE_CTX_KEY, NewError(http.StatusForbidden, http.StatusText(http.StatusForbidden)))))
				return
			}

			logger.Log(r.Context(), slog.LevelDebug, fmt.Sprintf("authed iamCredentials: %+v", iamCredentials))

			if strings.HasPrefix(r.URL.Path, fmt.Sprintf("%sapi/iam/logout", env.Get(ENV_WEB_SERVICE_BASE_PATH))) {
				if err := openId.OpenIDRevokeToken(openIDToken); err != nil {
					logger.Log(r.Context(), slog.LevelWarn, fmt.Sprintf("revoke open id token for logout failed, error: %v", err))
				}
				token := new(IamAccessRefreshToken)
				IamSetCookieInResponse(w, iamCookie, token, 0, 0)
			}

			next.ServeHTTP(w, r.WithContext(context.WithValue(r.Context(), IAM_CREDENTIAL_ID_CTX_KEY, *iamCredentials)))
		})
	}
}

func IamHttpRequestCtxGetAuthedIamCredential(r *http.Request) (*intdoment.IamCredentials, error) {
	if iamCredID, ok := r.Context().Value(IAM_CREDENTIAL_ID_CTX_KEY).(intdoment.IamCredentials); ok {
		return &iamCredID, nil
	}
	return nil, NewError(http.StatusUnauthorized, http.StatusText(http.StatusUnauthorized))
}

const IAM_CREDENTIAL_ID_CTX_KEY = CtxKey("iam_credential_id")

func IamGetCurrentUserIamCredentialID(r *http.Request) (*intdoment.IamCredentials, error) {
	if iamCredID, ok := r.Context().Value(IAM_CREDENTIAL_ID_CTX_KEY).(intdoment.IamCredentials); ok {
		return &iamCredID, nil
	}
	if err, ok := r.Context().Value(ERROR_CODE_CTX_KEY).(error); ok {
		return nil, err
	}
	return nil, NewError(http.StatusInternalServerError, http.StatusText(http.StatusInternalServerError))
}

func GetTokenCookie(iamCookie http.Cookie, token string, refreshTokenAge int) *http.Cookie {
	return &http.Cookie{
		Name:     iamCookie.Name,
		Value:    token,
		MaxAge:   refreshTokenAge,
		HttpOnly: iamCookie.HttpOnly,
		Secure:   iamCookie.Secure,
		SameSite: iamCookie.SameSite,
		Domain:   iamCookie.Domain,
		Path:     iamCookie.Path,
	}
}

func IamSetCookieInResponse(w http.ResponseWriter, iamCookie http.Cookie, token *IamAccessRefreshToken, accessExpiresIn int, refreshExpiresIn int) {
	cookiePrefix := iamCookie.Name
	iamCookie.Name = IamCookieGetAccessTokenName(cookiePrefix)
	http.SetCookie(w, GetTokenCookie(iamCookie, token.AccessToken, accessExpiresIn))
	iamCookie.Name = IamCookieGetRefreshTokenName(cookiePrefix)
	http.SetCookie(w, GetTokenCookie(iamCookie, token.RefreshToken, refreshExpiresIn))
}

func IamPrepOpenIDTokenForClient(env *EnvVariables, token *intdoment.OpenIDToken) (*IamAccessRefreshToken, error) {
	tk := new(IamAccessRefreshToken)
	tk.AccessToken = base64.StdEncoding.EncodeToString([]byte(token.AccessToken))
	tk.RefreshToken = base64.StdEncoding.EncodeToString([]byte(token.RefreshToken))

	if env.Get(ENV_IAM_ENCRYPT_TOKENS) != "false" {
		if encrypted, err := EncryptData(env.Get(ENV_IAM_ENCRYPTION_KEY), []byte(tk.AccessToken)); err != nil {
			return nil, fmt.Errorf("encrypt minAccessRefreshToken failed, error: %v", err)
		} else {
			tk.AccessToken = encrypted
		}
		if encrypted, err := EncryptData(env.Get(ENV_IAM_ENCRYPTION_KEY), []byte(tk.RefreshToken)); err != nil {
			return nil, fmt.Errorf("encrypt minAccessRefreshToken failed, error: %v", err)
		} else {
			tk.RefreshToken = encrypted
		}
	}

	return tk, nil
}

type IamAccessRefreshToken struct {
	AccessToken  string `json:"access_token,omitempty"`
	RefreshToken string `json:"refresh_token,omitempty"`
}

func IamInitCookie(env *EnvVariables) http.Cookie {
	iamCookie := http.Cookie{}
	if cookieName := os.Getenv("IAM_COOKIE_NAME"); len(cookieName) > 0 {
		iamCookie.Name = cookieName
	} else {
		iamCookie.Name = WebServiceAppPrefix()
	}
	if os.Getenv("IAM_COOKIE_HTTP_ONLY") == "true" {
		iamCookie.HttpOnly = true
	} else {
		iamCookie.HttpOnly = false
	}
	if os.Getenv("IAM_COOKIE_SECURE") == "true" {
		iamCookie.Secure = true
	} else {
		iamCookie.Secure = false
	}
	if sameSite, err := strconv.Atoi(os.Getenv("IAM_COOKIE_SAME_SITE")); err != nil {
		iamCookie.SameSite = http.SameSite(http.SameSiteStrictMode)
	} else {
		iamCookie.SameSite = http.SameSite(sameSite)
	}
	iamCookie.Domain = os.Getenv("IAM_COOKIE_DOMAIN")
	iamCookie.Path = env.Get(ENV_WEB_SERVICE_BASE_PATH)
	return iamCookie
}

func IamCookieGetAccessTokenName(iamCookieName string) string {
	return iamCookieName + "_z"
}

func IamCookieGetRefreshTokenName(iamCookieName string) string {
	return iamCookieName + "_y"
}
