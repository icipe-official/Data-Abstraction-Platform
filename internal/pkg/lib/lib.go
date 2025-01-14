package lib

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"encoding/base64"
	"errors"
	"fmt"
	"io"
	"net/http"

	"github.com/go-chi/httplog/v2"
	intpkgdatabasemodels "github.com/icipe-official/Data-Abstraction-Platform/internal/pkg/database/models"
	intpkgiamopenid "github.com/icipe-official/Data-Abstraction-Platform/internal/pkg/iam/open_id"
	"github.com/jackc/pgx/v5/pgxpool"
)

type SessionData struct {
	OpenidEndpoints struct {
		LoginEndpoint        string `json:"login_endpoint,omitempty"`
		RegistrationEndpoint string `json:"registration_endpoint,omitempty"`
	} `json:"openid_endpoints,omitempty"`
	IamCredential *intpkgdatabasemodels.IamCredentials `json:"iam_credential,omitempty"`
}

func DecryptData(encryptionKey string, data string) (string, error) {
	encryptedData, err := base64.URLEncoding.DecodeString(data)
	if err != nil {
		return "", fmt.Errorf("decode data string failed, error: %v", err.Error())
	}

	cipherBlock, err := aes.NewCipher([]byte(encryptionKey))
	if err != nil {
		return "", fmt.Errorf("generate cipher block failed, error: %v", err)
	}

	if len(encryptedData) < aes.BlockSize {
		return "", errors.New("encryptedData length less than aes.BlockSize")
	}

	iv := encryptedData[:aes.BlockSize]
	encryptedData = encryptedData[aes.BlockSize:]
	stream := cipher.NewCFBDecrypter(cipherBlock, iv)
	stream.XORKeyStream(encryptedData, encryptedData)
	return string(encryptedData), nil
}

// data can be converted to a json string and passed as []byte(data)
func EncryptData(encryptionKey string, data []byte) (string, error) {
	cipherBlock, err := aes.NewCipher([]byte(encryptionKey))
	if err != nil {
		return "", fmt.Errorf("generate cipher block failed, error: %v", err)
	}

	encryptedData := make([]byte, aes.BlockSize+len(data))
	iv := encryptedData[:aes.BlockSize]
	if _, err := io.ReadFull(rand.Reader, iv); err != nil {
		return "", fmt.Errorf("validate iv failed, error: %v", err)
	}

	stream := cipher.NewCFBEncrypter(cipherBlock, iv)
	stream.XORKeyStream(encryptedData[aes.BlockSize:], data)
	return base64.URLEncoding.EncodeToString(encryptedData), nil
}

type WebService struct {
	PgxPool      *pgxpool.Pool
	Logger       *httplog.Logger
	Env          map[string]string
	HtmlPages    map[string]string
	OpenIDConfig *intpkgiamopenid.Configuration
	IamCookie    http.Cookie
}

const (
	ENV_IAM_ENCRYPTION_KEY string = "IAM_ENCRYPTION_KEY"
	ENV_IAM_ENCRYPT_TOKENS string = "IAM_ENCRYPT_TOKENS"

	ENV_WEB_SERVICE_BASE_PATH string = "WEB_SERVICE_BASE_PATH"
	ENV_WEBSITE_BASE_URL      string = "WEBSITE_BASE_URL"
	ENV_WEBSITE_DIRECTORY     string = "WEBSITE_DIRECTORY"

	ENV_OPENID_CLIENT_ID                  string = "OPENID_CLIENT_ID"
	ENV_OPENID_CLIENT_SECRET              string = "OPENID_CLIENT_SECRET"
	ENV_OPENID_USER_REGISTRATION_ENDPOINT string = "OPENID_USER_REGISTRATION_ENDPOINT"
	ENV_OPENID_LOGIN_ENDPOINT             string = "OPENID_LOGIN_ENDPOINT"
	ENV_OPENID_LOGIN_REDIRECT_URL         string = "OPENID_LOGIN_REDIRECT_URL"
)

type CtxKey string

const LOG_ATTR_CTX_KEY CtxKey = "LOG_ATTR"
