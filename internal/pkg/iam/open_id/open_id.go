package openid

import "github.com/gofrs/uuid/v5"

const (
	GRANT_TYPE_AUTHORIZATION_CODE string = "authorization_code"
	GRANT_TYPE_REFRESH_TOKEN      string = "refresh_token"
	GRANT_TYPE_PASSWORD           string = "password"

	RESPONSE_TYPE_CODE string = "code"
)

type RedirectParams struct {
	SessionState string
	Iss          string
	Code         string
}

type Configuration struct {
	Issuer                     string   `json:"issuer,omitempty"`
	AuthorizationEndpoint      string   `json:"authorization_endpoint,omitempty"`
	TokenEndpoint              string   `json:"token_endpoint,omitempty"`
	TokenIntrospectionEndpoint string   `json:"introspection_endpoint,omitempty"`
	UserinfoEndpoint           string   `json:"userinfo_endpoint,omitempty"`
	RevocationEndpoint         string   `json:"revocation_endpoint,omitempty"`
	GrantTypesSupported        []string `json:"grant_types_supported,omitempty"`
	ResponseTypesSupported     []string `json:"response_types_supported,omitempty"`
}

type Token struct {
	AccessToken      string `json:"access_token,omitempty"`
	ExpiresIn        int64  `json:"expires_in,omitempty"`
	RefreshExpiresIn int64  `json:"refresh_expires_in,omitempty"`
	RefreshToken     string `json:"refresh_token,omitempty"`
	TokenType        string `json:"token_type,omitempty"`
	IDToken          string `json:"id_token,omitempty"`
	NotBeforePolicy  int    `json:"not-before-policy,omitempty"`
	SessionState     string `json:"session_state,omitempty"`
	Scope            string `json:"scope,omitempty"`
}

type UserInfo struct {
	Sub               uuid.UUID `json:"sub,omitempty"`
	EmailVerified     bool      `json:"email_verified,omitempty"`
	Name              string    `json:"name,omitempty"`
	PreferredUsername string    `json:"preferred_username,omitempty"`
	GivenName         string    `json:"given_name,omitempty"`
	FamilyName        string    `json:"family_name,omitempty"`
	Email             string    `json:"email,omitempty"`
}

type TokenIntrospect struct {
	Exp            int64    `json:"exp,omitempty"`
	Iat            int64    `json:"iat,omitempty"`
	Jti            string   `json:"jti,omitempty"`
	Iss            string   `json:"iss,omitempty"`
	Aud            []string `json:"aud,omitempty"`
	Sub            string   `json:"sub,omitempty"`
	Type           string   `json:"type,omitempty"`
	Azp            string   `json:"azp,omitempty"`
	Sid            string   `json:"sid,omitempty"`
	Acr            string   `json:"acr,omitempty"`
	AllowedOrigins []string `json:"allowed_origns,omitempty"`
	RealmAccess    struct {
		Roles []string `json:"roles,omitempty"`
	} `json:"realm_access,omitempty"`
	ResourceAccess struct {
		RealmManagement struct {
			Roles []string `json:"roles,omitempty"`
		} `json:"realm-management,omitempty"`
		Broker struct {
			Roles []string `json:"roles,omitempty"`
		} `json:"broker,omitempty"`
		Account struct {
			Roles []string `json:"roles,omitempty"`
		} `json:"account,omitempty"`
	} `json:"resource_access,omitempty"`
	Scope             string `json:"scope,omitempty"`
	EmailVerified     bool   `json:"email_verified,omitempty"`
	Name              string `json:"name,omitempty"`
	PreferredUsername string `json:"preferred_username,omitempty"`
	GivenName         string `json:"given_name,omitempty"`
	FamilyName        string `json:"family_name,omitempty"`
	Email             string `json:"email,omitempty"`
	ClientID          string `json:"client_id,omitempty"`
	Username          string `json:"username,omitempty"`
	TokenType         string `json:"token_type,omitempty"`
	Active            bool   `json:"active,omitempty"`
}
