package models

import (
	"time"

	"github.com/gofrs/uuid/v5"
)

type IamCredentialsSessions struct {
	OpenidSid []uuid.UUID `json:"openid_sid,omitempty"`
	OpenidSub []uuid.UUID `json:"openid_sub,omitempty"`
	CreatedOn []time.Time `json:"created_on,omitempty"`
	ExpiresOn []time.Time `json:"expires_on,omitempty"`
}

type iamCredentialsSessionsTable struct {
	TableName string

	OpenidSid string
	OpenidSub string
	CreatedOn string
	ExpiresOn string
}

func IamCredentialsSessionsTable() iamCredentialsSessionsTable {
	return iamCredentialsSessionsTable{
		TableName: "iam_credentials_sessions",

		OpenidSid: "openid_sid",
		OpenidSub: "openid_sub",
		CreatedOn: "created_on",
		ExpiresOn: "expires_on",
	}
}
