package home

import (
	"context"

	intdoment "github.com/icipe-official/Data-Abstraction-Platform/internal/domain/entities"
	intpkgiamopenid "github.com/icipe-official/Data-Abstraction-Platform/internal/pkg/iam/open_id"
	intpkglib "github.com/icipe-official/Data-Abstraction-Platform/internal/pkg/lib"
	intpkgwebsite "github.com/icipe-official/Data-Abstraction-Platform/internal/pkg/website"
)

type requestResponseContextData struct {
	HTMLIsPartialRequest string
	HTMLPartialName      string
	HTMLContent          string
	WebService           *intpkglib.WebService
	Context              context.Context
	HTMLHomePageContext  *intpkgwebsite.RoutesContext
	RedirectData         *intpkgiamopenid.RedirectParams
	OpenidUserInfo       *intpkgiamopenid.UserInfo
	OpenidToken          *intpkgiamopenid.Token
	IamCredential        *intdoment.IamCredentials
}

const (
	redirect_PARAM_SESSION_STATE string = "session_state"
	redirect_PARAM_ISS           string = "iss"
	redirect_PARAM_CODE          string = "code"
)
