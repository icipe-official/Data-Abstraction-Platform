package iam

import (
	"context"
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log/slog"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/go-chi/httplog/v2"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/redis/go-redis/v9"
	intpkgappinstance "github.com/rogonion/rahab-platform/internal/pkg/app_instance"
	intpkgdatabasemodels "github.com/rogonion/rahab-platform/internal/pkg/database/models"
	intpkglib "github.com/rogonion/rahab-platform/internal/pkg/lib"
	intpkgutils "github.com/rogonion/rahab-platform/internal/pkg/utils"
)

const (
	IAM_TICKET_EMAIL_VERIFICATION string = "email_verification"
	IAM_TICKET_PHONE_VERIFICATION string = "phone_verification"
	IAM_TICKET_PASSWORD_RESET     string = "password_reset"
)

type groupRuleAuthorizationGroupID struct {
	ID        uuid.UUID
	CreatedOn time.Time
}

type IamCredentialAndSessionID struct {
	intpkgdatabasemodels.IamCredentials
	SessionID string
}

type IamGroupAuthorizationJoinGroupRuleAuthorization struct {
	ID                          uuid.UUID `json:"id,omitempty"`
	CreatedOn                   time.Time `json:"created_on,omitempty"`
	GroupID                     uuid.UUID `json:"group_id,omitempty"`
	GroupCreatedOn              time.Time `json:"group_created_on,omitempty"`
	GroupAuthorizationRuleID    string    `json:"group_authorization_rule_id,omitempty"`
	GroupAuthorizationRuleGroup string    `json:"group_authorization_rule_group,omitempty"`
}

type IamGroupAuthorizationIDs map[string]*IamGroupAuthorizationJoinGroupRuleAuthorization

func genIamGroupAuthorizationIDsKey(groupRuleAuthorizationID uuid.UUID, groupRuleAuthorizationCreatedOn time.Time, groupRuleAuthorizationRuleID string, groupRuleAuthorizationRuleGroup string) string {
	return fmt.Sprintf("%s/%s/%s/%s",
		groupRuleAuthorizationID,
		groupRuleAuthorizationCreatedOn.Format(time.RFC3339),
		groupRuleAuthorizationRuleID,
		groupRuleAuthorizationRuleGroup,
	)
}

// returns the first matching result
func GetIamGroupAuthorizationIDForRequest(ctx context.Context, webService *intpkglib.WebService, iamCredentialID *IamCredentialAndSessionID, authContextDirectoryGroupID *intpkglib.DirectoryGroupID, groupAuthorizationRules []*intpkglib.GroupAuthorizationRule, currentIamGroupAuthorizationIDs *IamGroupAuthorizationIDs) ([]*IamGroupAuthorizationJoinGroupRuleAuthorization, error) {
	if iamCredentialID == nil {
		return nil, nil
	}

	selectColumns := []string{
		fmt.Sprintf("%s.%s", intpkgdatabasemodels.IamGroupAuthorizationTable().TableName, intpkgdatabasemodels.IamGroupAuthorizationTable().ID),                            //1
		fmt.Sprintf("%s.%s", intpkgdatabasemodels.IamGroupAuthorizationTable().TableName, intpkgdatabasemodels.IamGroupAuthorizationTable().CreatedOn),                     //2
		fmt.Sprintf("%s.%s", intpkgdatabasemodels.GroupRuleAuthorizationTable().TableName, intpkgdatabasemodels.GroupRuleAuthorizationTable().GroupID),                     //3
		fmt.Sprintf("%s.%s", intpkgdatabasemodels.GroupRuleAuthorizationTable().TableName, intpkgdatabasemodels.GroupRuleAuthorizationTable().GroupCreatedOn),              //4
		fmt.Sprintf("%s.%s", intpkgdatabasemodels.GroupRuleAuthorizationTable().TableName, intpkgdatabasemodels.GroupRuleAuthorizationTable().GroupAuthorizationRuleID),    //5
		fmt.Sprintf("%s.%s", intpkgdatabasemodels.GroupRuleAuthorizationTable().TableName, intpkgdatabasemodels.GroupRuleAuthorizationTable().GroupAuthorizationRuleGroup), //6
	}

	groupRuleAuthorizationGroupID := new(groupRuleAuthorizationGroupID)
	if authContextDirectoryGroupID != nil {
		groupRuleAuthorizationGroupID.ID = authContextDirectoryGroupID.ID
		groupRuleAuthorizationGroupID.CreatedOn = authContextDirectoryGroupID.CreatedOn
	} else {
		groupRuleAuthorizationGroupID.ID = iamCredentialID.DirectoryID[0].DirectoryGroupID[0]
		groupRuleAuthorizationGroupID.CreatedOn = iamCredentialID.DirectoryID[0].DirectoryGroupCreatedOn[0]
	}

	nextPlaceholder := 1
	whereOrConditions := make([]string, 0)
	valuesForCondition := make([]any, 0)
	cacheIamGroupAuthorization := make([]*IamGroupAuthorizationJoinGroupRuleAuthorization, 0)
	for _, gar := range groupAuthorizationRules {
		if currentIamGroupAuthorizationIDs != nil {
			if iamGroupAuthorizationID, ok := (*currentIamGroupAuthorizationIDs)[genIamGroupAuthorizationIDsKey(
				groupRuleAuthorizationGroupID.ID,
				groupRuleAuthorizationGroupID.CreatedOn,
				gar.ID,
				gar.RuleGroup,
			)]; ok {
				cacheIamGroupAuthorization = append(cacheIamGroupAuthorization, iamGroupAuthorizationID)
				continue
			}
		}
		whereAndCondition := make([]string, 0)
		whereAndCondition = append(whereAndCondition, fmt.Sprintf("%s.%s = $%d", intpkgdatabasemodels.GroupRuleAuthorizationTable().TableName, intpkgdatabasemodels.GroupRuleAuthorizationTable().GroupID, nextPlaceholder))
		valuesForCondition = append(valuesForCondition, groupRuleAuthorizationGroupID.ID)
		nextPlaceholder += 1
		whereAndCondition = append(whereAndCondition, fmt.Sprintf("%s.%s = $%d", intpkgdatabasemodels.GroupRuleAuthorizationTable().TableName, intpkgdatabasemodels.GroupRuleAuthorizationTable().GroupCreatedOn, nextPlaceholder))
		valuesForCondition = append(valuesForCondition, groupRuleAuthorizationGroupID.CreatedOn)
		nextPlaceholder += 1
		if gar.ID != "*" && len(gar.ID) > 0 {
			whereAndCondition = append(whereAndCondition, fmt.Sprintf("%s.%s = $%d", intpkgdatabasemodels.GroupRuleAuthorizationTable().TableName, intpkgdatabasemodels.GroupRuleAuthorizationTable().GroupAuthorizationRuleID, nextPlaceholder))
			valuesForCondition = append(valuesForCondition, gar.ID)
			nextPlaceholder += 1
		}
		whereAndCondition = append(whereAndCondition, fmt.Sprintf("%s.%s = $%d", intpkgdatabasemodels.GroupRuleAuthorizationTable().TableName, intpkgdatabasemodels.GroupRuleAuthorizationTable().GroupAuthorizationRuleGroup, nextPlaceholder))
		valuesForCondition = append(valuesForCondition, gar.RuleGroup)
		nextPlaceholder += 1
		whereOrConditions = append(whereOrConditions, strings.Join(whereAndCondition, " AND "))
	}
	if len(cacheIamGroupAuthorization) > 0 {
		return cacheIamGroupAuthorization, nil
	}

	if len(whereOrConditions) == 0 || len(valuesForCondition) == 0 {
		return nil, errors.New("groupAuthorizationRules invalid")
	}

	query := fmt.Sprintf(
		"SELECT %[1]s FROM %[2]s INNER JOIN %[3]s ON %[2]s.%[4]s = %[3]s.%[5]s AND %[2]s.%[6]s = %[3]s.%[7]s WHERE %[8]s AND %[2]s.%[9]s IS NULL AND %[3]s.%[10]s IS NULL AND %[2]s.%[11]s = %[12]s AND %[2]s.%[13]s = %[14]s;",
		strings.Join(selectColumns, " , "),                                                //1
		intpkgdatabasemodels.IamGroupAuthorizationTable().TableName,                       //2
		intpkgdatabasemodels.GroupRuleAuthorizationTable().TableName,                      //3
		intpkgdatabasemodels.IamGroupAuthorizationTable().GroupRuleAuthorizationID,        //4
		intpkgdatabasemodels.GroupRuleAuthorizationTable().ID,                             //5
		intpkgdatabasemodels.IamGroupAuthorizationTable().GroupRuleAuthorizationCreatedOn, //6
		intpkgdatabasemodels.GroupRuleAuthorizationTable().CreatedOn,                      //7
		strings.Join(whereOrConditions, " OR "),                                           //8
		intpkgdatabasemodels.IamGroupAuthorizationTable().DeactivatedOn,                   //9
		intpkgdatabasemodels.GroupRuleAuthorizationTable().DeactivatedOn,                  //10
		intpkgdatabasemodels.IamGroupAuthorizationTable().IamCredentialsID,                //11
		intpkgutils.PostgresGetandUpdateNextPlaceholder(&nextPlaceholder),                 //12
		intpkgdatabasemodels.IamGroupAuthorizationTable().IamCredentialsCreatedOn,         //13
		intpkgutils.PostgresGetandUpdateNextPlaceholder(&nextPlaceholder),                 //14
	)
	webService.Logger.Log(ctx, slog.LevelDebug, query, ctx.Value(intpkglib.LOG_ATTR_CTX_KEY))
	valuesForCondition = append(
		valuesForCondition,
		iamCredentialID.IamCredentialID[0].ID[0],
		iamCredentialID.IamCredentialID[0].CreatedOn[0],
	)

	newIamGroupAuthorizationIDs := make([]*IamGroupAuthorizationJoinGroupRuleAuthorization, 0)
	rows, err := webService.PgxPool.Query(ctx, query, valuesForCondition...)
	if err != nil {
		msg := fmt.Errorf("get %s failed, error: %v", intpkgdatabasemodels.IamGroupAuthorizationTable().TableName, err)
		webService.Logger.Log(ctx, slog.LevelDebug, msg.Error(), ctx.Value(intpkglib.LOG_ATTR_CTX_KEY))
		return nil, msg
	}
	for rows.Next() {
		newIamGroupAuthorizationID := new(IamGroupAuthorizationJoinGroupRuleAuthorization)
		if err := rows.Scan(&newIamGroupAuthorizationID.ID, &newIamGroupAuthorizationID.CreatedOn, &newIamGroupAuthorizationID.GroupID, &newIamGroupAuthorizationID.GroupCreatedOn, &newIamGroupAuthorizationID.GroupAuthorizationRuleID, &newIamGroupAuthorizationID.GroupAuthorizationRuleGroup); err != nil {
			msg := fmt.Errorf("read %s row failed, error: %v", intpkgdatabasemodels.IamGroupAuthorizationTable().TableName, err)
			webService.Logger.Log(ctx, slog.LevelDebug, msg.Error(), ctx.Value(intpkglib.LOG_ATTR_CTX_KEY))
			return nil, msg
		}
		newIamGroupAuthorizationIDs = append(newIamGroupAuthorizationIDs, newIamGroupAuthorizationID)
		if currentIamGroupAuthorizationIDs != nil {
			(*currentIamGroupAuthorizationIDs)[genIamGroupAuthorizationIDsKey(
				newIamGroupAuthorizationID.GroupID,
				newIamGroupAuthorizationID.GroupCreatedOn,
				newIamGroupAuthorizationID.GroupAuthorizationRuleID,
				newIamGroupAuthorizationID.GroupAuthorizationRuleGroup,
			)] = newIamGroupAuthorizationID
		}
	}

	if len(newIamGroupAuthorizationIDs) > 0 {
		return newIamGroupAuthorizationIDs, nil
	} else {
		return nil, nil
	}
}

func jwtGetIssuer() string {
	return fmt.Sprintf("%s/%s", os.Getenv("WEB_SERVICE_APP_PREFIX"), intpkgappinstance.APP_INSTANCE_WEB_SERVICE_API_CORE)
}

func AuthenticationMiddleware(webService *intpkglib.WebService) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			appPrefix := intpkgutils.WebServiceAppPrefix()
			encryptedToken, err := r.Cookie(appPrefix)
			if err != nil {
				webService.Logger.Log(r.Context(), slog.LevelDebug, fmt.Sprintf("get encrypted token failed, error: %v", err))
				next.ServeHTTP(w, r.WithContext(context.WithValue(r.Context(), intpkglib.ERROR_CODE_CTX_KEY, intpkgutils.NewError(http.StatusUnauthorized, http.StatusText(http.StatusUnauthorized)))))
				return
			}
			decryptedToken, err := decryptToken(encryptedToken.Value, webService.Logger, r.Context())
			if err != nil {
				next.ServeHTTP(w, r.WithContext(context.WithValue(r.Context(), intpkglib.ERROR_CODE_CTX_KEY, err)))
				return
			}
			sessionID, err := verifyTokenAndGetSessionID(decryptedToken, webService.Logger, r.Context())
			if err != nil {
				next.ServeHTTP(w, r.WithContext(context.WithValue(r.Context(), intpkglib.ERROR_CODE_CTX_KEY, err)))
				return
			}

			iamCredential, sessionMinutesRemaning, err := RedisGetIamCredentialID(r.Context(), webService.RedisClient, sessionID, webService.Logger)
			if err != nil {
				next.ServeHTTP(w, r.WithContext(context.WithValue(r.Context(), intpkglib.ERROR_CODE_CTX_KEY, err)))
				return
			}

			if sessionMinutesRemaning <= 60.0 {

			} else {
				iamCredential.SessionID = sessionID
			}

			next.ServeHTTP(w, r.WithContext(context.WithValue(r.Context(), IAM_CREDENTIAL_ID_CTX_KEY, *iamCredential)))
		})
	}
}

// func AuthenticationMiddleware2(next http.Handler) http.Handler {
// 	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
// 		appPrefix := intpkgutils.WebServiceAppPrefix()
// 		encryptedToken, err := r.Cookie(appPrefix)
// 		if err != nil {
// 			next.ServeHTTP(w, r.WithContext(context.WithValue(r.Context(), intpkglib.ERROR_CODE_CTX_KEY, intpkgutils.NewError(http.StatusUnauthorized, http.StatusText(http.StatusUnauthorized)))))
// 			return
// 		}
// 		decryptedToken, err := decryptToken(encryptedToken.Value)
// 		if err != nil {
// 			next.ServeHTTP(w, r.WithContext(context.WithValue(r.Context(), intpkglib.ERROR_CODE_CTX_KEY, err)))
// 			return
// 		}
// 		sessionID, err := verifyTokenAndGetSessionID(decryptedToken)
// 		if err != nil {
// 			next.ServeHTTP(w, r.WithContext(context.WithValue(r.Context(), intpkglib.ERROR_CODE_CTX_KEY, err)))
// 			return
// 		}

// 		redisClient, err := intpkgdatabase.NewRedisClient()
// 		if err != nil {
// 			next.ServeHTTP(w, r.WithContext(context.WithValue(r.Context(), intpkglib.ERROR_CODE_CTX_KEY, intpkgutils.NewError(http.StatusInternalServerError, http.StatusText(http.StatusInternalServerError)))))
// 			return
// 		}
// 		iamCredential, sessionMinutesRemaning, err := RedisGetIamCredentialID(r.Context(), redisClient, sessionID)
// 		if err != nil {
// 			next.ServeHTTP(w, r.WithContext(context.WithValue(r.Context(), intpkglib.ERROR_CODE_CTX_KEY, err)))
// 			return
// 		}

// 		if sessionMinutesRemaning <= 60.0 {

// 		} else {
// 			iamCredential.SessionID = sessionID
// 		}

// 		next.ServeHTTP(w, r.WithContext(context.WithValue(r.Context(), IAM_CREDENTIAL_ID_CTX_KEY, *iamCredential)))
// 	})
// }

func HttpRequestCtxGetIamCredentialID(r *http.Request) *IamCredentialAndSessionID {
	iamCredID, ok := r.Context().Value(IAM_CREDENTIAL_ID_CTX_KEY).(IamCredentialAndSessionID)
	if ok {
		return &iamCredID
	}
	return nil
}

const IAM_CREDENTIAL_ID_CTX_KEY = intpkglib.CtxKey("iam_credential_id")

func GetCurrentUserIamCredentialID(r *http.Request) (*IamCredentialAndSessionID, error) {
	if iamCredID, ok := r.Context().Value(IAM_CREDENTIAL_ID_CTX_KEY).(IamCredentialAndSessionID); ok {
		return &iamCredID, nil
	}
	if err, ok := r.Context().Value(intpkglib.ERROR_CODE_CTX_KEY).(error); ok {
		return nil, err
	}
	return nil, intpkgutils.NewError(http.StatusInternalServerError, http.StatusText(http.StatusInternalServerError))
}

const (
	sessionPrefix            = "ssn"
	sessionTTL               = 24 * time.Hour
	ACCESS_REFRESH_TOKEN_AGE = 60 * 60 * 24
)

func RedisGetIamCredentialID(ctx context.Context, redisClient *redis.Client, sessionID string, logger *httplog.Logger) (*IamCredentialAndSessionID, float64, error) {
	iamCredentialID := new(IamCredentialAndSessionID)
	cmd := redisClient.Do(ctx, "JSON.GET", sessionID)
	if cmd.Err() != nil {
		logger.Log(ctx, slog.LevelDebug, fmt.Sprintf("Get sessionID failed, error: %v", cmd.Err()))
		return nil, 0.0, intpkgutils.NewError(http.StatusInternalServerError, http.StatusText(http.StatusInternalServerError))
	}
	if jsonData, err := cmd.Result(); err != nil {
		logger.Log(ctx, slog.LevelDebug, fmt.Sprintf("Get sessionID jsonData failed, error: %v", err))
		return nil, 0.0, intpkgutils.NewError(http.StatusInternalServerError, http.StatusText(http.StatusInternalServerError))
	} else {
		if err := json.Unmarshal([]byte(fmt.Sprintln(jsonData)), iamCredentialID); err != nil {
			logger.Log(ctx, slog.LevelDebug, fmt.Sprintf("Unmarshal jsonData failed, error: %v", err))
			return nil, 0.0, intpkgutils.NewError(http.StatusInternalServerError, http.StatusText(http.StatusInternalServerError))
		}
	}

	return iamCredentialID, redisClient.TTL(ctx, sessionID).Val().Minutes(), nil
}

func RedisDeleteSession(ctx context.Context, redisClient *redis.Client, sessionID string) error {
	if err := redisClient.Do(ctx, "JSON.DEL", sessionID).Err(); err != nil {
		return fmt.Errorf("delete session id failed, error: %v", err)
	}

	return nil
}

func RedisCreateNewSesion(ctx context.Context, redisClient *redis.Client, iamCredentialID *intpkgdatabasemodels.IamCredentials) (string, error) {
	newSessionID := redisSessionKey(uuid.New().String(), time.Now().Local().UTC().Format(time.RFC3339))

	jsonData, err := json.Marshal(iamCredentialID)

	if err != nil {
		return "", fmt.Errorf("marshal iam_credential data failed, error: %v", err)
	}

	if err := redisClient.Do(ctx, "JSON.SET", newSessionID, "$", string(jsonData)).Err(); err != nil {
		return "", fmt.Errorf("create new session failed, error: %v", err)
	}

	if err := redisClient.Expire(ctx, newSessionID, sessionTTL).Err(); err != nil {
		return "", fmt.Errorf("set expiration for new session failed, error: %v", err)
	}

	return newSessionID, nil
}

func redisSessionKey(sessionId string, sessionCreatedOn string) string {

	return fmt.Sprintf("%s/%s/%s/%s", intpkgutils.WebServiceAppPrefix(), sessionPrefix, sessionId, sessionCreatedOn)
}

func GenerateAccessRefreshToken(sessionID string) (string, error) {
	token, err := generateToken(sessionID, sessionTTL).SignedString([]byte(os.Getenv("IAM_ACCESS_REFRESH_TOKEN")))
	if err != nil {
		return "", fmt.Errorf("sign token failed, error: %v", err)
	}

	encryptedToken, err := encryptToken(token)
	if err != nil {
		return "", fmt.Errorf("encrypt token failed, error: %v", err)
	}

	return encryptedToken, nil
}

func encryptToken(token string) (string, error) {
	tokenToEncrypt := []byte(token)
	cipherBlock, err := aes.NewCipher([]byte(os.Getenv("IAM_ENCRYPTION_KEY")))
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

func generateToken(sessionID string, ttl time.Duration) *jwt.Token {
	return jwt.NewWithClaims(
		jwt.SigningMethodHS256,
		jwt.RegisteredClaims{
			Issuer:    jwtGetIssuer(),
			Subject:   sessionID,
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(ttl)),
		},
	)
}

func verifyTokenAndGetSessionID(token string, logger *httplog.Logger, ctx context.Context) (string, error) {
	validatedToken, err := jwt.Parse(token, func(t *jwt.Token) (interface{}, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			logger.Log(ctx, slog.LevelDebug, "token signature does not match")
			return nil, intpkgutils.NewError(http.StatusUnauthorized, http.StatusText(http.StatusUnauthorized))
		}
		return []byte(os.Getenv("IAM_ACCESS_REFRESH_TOKEN")), nil
	})

	if err != nil || !validatedToken.Valid {
		logger.Log(ctx, slog.LevelDebug, "token is not valid")
		return "", intpkgutils.NewError(http.StatusUnauthorized, http.StatusText(http.StatusUnauthorized))
	}

	claims := validatedToken.Claims.(jwt.MapClaims)
	if issuer, err := claims.GetIssuer(); err != nil || issuer != jwtGetIssuer() {
		logger.Log(ctx, slog.LevelDebug, fmt.Sprintf("Get issuer failed, error: %v || Issuers not equal: %v.", err, issuer != jwtGetIssuer()))
		return "", intpkgutils.NewError(http.StatusUnauthorized, http.StatusText(http.StatusUnauthorized))
	}
	if sessionID, err := claims.GetSubject(); err != nil {
		logger.Log(ctx, slog.LevelDebug, "sessionID not found")
		return "", intpkgutils.NewError(http.StatusUnauthorized, http.StatusText(http.StatusUnauthorized))
	} else {
		return sessionID, nil
	}
}

func decryptToken(token string, logger *httplog.Logger, ctx context.Context) (string, error) {
	encryptedToken, err := base64.URLEncoding.DecodeString(token)
	if err != nil {
		logger.Log(ctx, slog.LevelDebug, fmt.Sprintf("decode token failed, error: %v", err.Error()))
		return "", intpkgutils.NewError(http.StatusInternalServerError, http.StatusText(http.StatusInternalServerError))
	}

	cipherBlock, err := aes.NewCipher([]byte(os.Getenv("IAM_ENCRYPTION_KEY")))
	if err != nil {
		logger.Log(ctx, slog.LevelDebug, fmt.Sprintf("generate cipher block failed, error: %v", err.Error()))
		return "", intpkgutils.NewError(http.StatusInternalServerError, http.StatusText(http.StatusInternalServerError))
	}

	if len(encryptedToken) < aes.BlockSize {
		return "", intpkgutils.NewError(http.StatusUnauthorized, http.StatusText(http.StatusUnauthorized))
	}

	iv := encryptedToken[:aes.BlockSize]
	encryptedToken = encryptedToken[aes.BlockSize:]
	stream := cipher.NewCFBDecrypter(cipherBlock, iv)
	stream.XORKeyStream(encryptedToken, encryptedToken)
	return string(encryptedToken), nil
}
