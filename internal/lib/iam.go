package lib

import (
	"context"
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"log/slog"
	"net/http"
	"os"
	"strconv"

	intdoment "github.com/icipe-official/Data-Abstraction-Platform/internal/domain/entities"
	intdomint "github.com/icipe-official/Data-Abstraction-Platform/internal/domain/interfaces"
)

func iamJwtGetIssuer() string {
	return os.Getenv("WEB_SERVICE_APP_PREFIX")
}

func IamAuthenticationMiddleware(logger intdomint.Logger, envMap *EnvVariables, openId intdomint.OpenID) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			appPrefix := WebServiceAppPrefix()
			encryptedToken, err := r.Cookie(appPrefix)
			if err != nil {
				logger.Log(r.Context(), slog.LevelDebug, fmt.Sprintf("get encrypted token failed, error: %v", err))
				next.ServeHTTP(w, r.WithContext(context.WithValue(r.Context(), ERROR_CODE_CTX_KEY, NewError(http.StatusUnauthorized, http.StatusText(http.StatusUnauthorized)))))
				return
			}
			decryptedToken, err := iamDecryptToken(r.Context(), logger, envMap, encryptedToken.Value)
			if err != nil {
				logger.Log(r.Context(), slog.LevelDebug, fmt.Sprintf("decrypt token failed, error: %v", err))
				next.ServeHTTP(w, r.WithContext(context.WithValue(r.Context(), ERROR_CODE_CTX_KEY, NewError(http.StatusUnauthorized, http.StatusText(http.StatusUnauthorized)))))
				return
			}
			//OpenID stuff Here
			logger.Log(r.Context(), slog.LevelDebug, "decryptedToken", decryptedToken)

			next.ServeHTTP(w, r)
			//TODO: Get session
			// next.ServeHTTP(w, r.WithContext(context.WithValue(r.Context(), IAM_CREDENTIAL_ID_CTX_KEY, *iamCredential)))
		})
	}
}

func IamHttpRequestCtxGetIamCredentialID(r *http.Request) *intdoment.IamAuthInfo {
	iamCredID, ok := r.Context().Value(IAM_CREDENTIAL_ID_CTX_KEY).(intdoment.IamAuthInfo)
	if ok {
		return &iamCredID
	}
	return nil
}

const IAM_CREDENTIAL_ID_CTX_KEY = CtxKey("iam_credential_id")

func IamGetCurrentUserIamCredentialID(r *http.Request) (*intdoment.IamAuthInfo, error) {
	if iamCredID, ok := r.Context().Value(IAM_CREDENTIAL_ID_CTX_KEY).(intdoment.IamAuthInfo); ok {
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

func IamMinifyOpenIDToken(env *EnvVariables, token *intdoment.OpenIDToken) (string, error) {
	minAccessRefreshToken := ""

	if json, err := json.Marshal(
		IamAccessRefreshToken{
			AccessToken:  token.AccessToken,
			RefreshToken: token.RefreshToken,
		},
	); err != nil {
		return "", fmt.Errorf("convert token to json failed, error: %v", err)
	} else {
		minAccessRefreshToken = base64.StdEncoding.EncodeToString(json)
	}

	if env.Get(ENV_IAM_ENCRYPT_TOKENS) != "false" {
		if encryptedData, err := EncryptData(env.Get(ENV_IAM_ENCRYPTION_KEY), []byte(minAccessRefreshToken)); err != nil {
			return "", fmt.Errorf("encrypt minAccessRefreshToken failed, error: %v", err)
		} else {
			minAccessRefreshToken = encryptedData
		}
	}

	return minAccessRefreshToken, nil
}

type IamAccessRefreshToken struct {
	AccessToken  string `json:"access_token,omitempty"`
	RefreshToken string `json:"refresh_token,omitempty"`
}

func iamEncryptToken(envMap *EnvVariables, token string) (string, error) {
	tokenToEncrypt := []byte(token)
	cipherBlock, err := aes.NewCipher([]byte(envMap.Get(ENV_IAM_ENCRYPTION_KEY)))
	if err != nil {
		return "", fmt.Errorf("generate cipher block failed, error: %v", err)
	}

	encryptedToken := make([]byte, aes.BlockSize+len(tokenToEncrypt))
	iv := encryptedToken[:aes.BlockSize]
	if _, err := io.ReadFull(rand.Reader, iv); err != nil {
		return "", fmt.Errorf("validate iv failed, error: %v", err)
	}

	stream := cipher.NewCFBEncrypter(cipherBlock, iv)
	stream.XORKeyStream(encryptedToken[aes.BlockSize:], tokenToEncrypt)
	return base64.URLEncoding.EncodeToString(encryptedToken), nil
}

func iamDecryptToken(ctx context.Context, logger intdomint.Logger, envMap *EnvVariables, token string) (string, error) {
	encryptedToken, err := base64.URLEncoding.DecodeString(token)
	if err != nil {
		logger.Log(ctx, slog.LevelDebug, fmt.Sprintf("decode token failed, error: %v", err.Error()))
		return "", NewError(http.StatusInternalServerError, http.StatusText(http.StatusInternalServerError))
	}

	cipherBlock, err := aes.NewCipher([]byte(envMap.Get(ENV_IAM_ENCRYPTION_KEY)))
	if err != nil {
		logger.Log(ctx, slog.LevelDebug, fmt.Sprintf("generate cipher block failed, error: %v", err.Error()))
		return "", NewError(http.StatusInternalServerError, http.StatusText(http.StatusInternalServerError))
	}

	if len(encryptedToken) < aes.BlockSize {
		return "", NewError(http.StatusUnauthorized, http.StatusText(http.StatusUnauthorized))
	}

	iv := encryptedToken[:aes.BlockSize]
	encryptedToken = encryptedToken[aes.BlockSize:]
	stream := cipher.NewCFBDecrypter(cipherBlock, iv)
	stream.XORKeyStream(encryptedToken, encryptedToken)
	return string(encryptedToken), nil
}

func InitIamCookie(env *EnvVariables) http.Cookie {
	iamCookie := http.Cookie{}
	if cookieName := os.Getenv("IAM_COOKIE_NAME"); len(cookieName) > 0 {
		iamCookie.Name = cookieName
	} else {
		iamCookie.Name = "dap"
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
