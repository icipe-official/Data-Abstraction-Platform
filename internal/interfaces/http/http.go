package http

import (
	"net/http"

	intdomint "github.com/icipe-official/Data-Abstraction-Platform/internal/domain/interfaces"
	intrepopostgres "github.com/icipe-official/Data-Abstraction-Platform/internal/interfaces/repository/postgres"
	intlib "github.com/icipe-official/Data-Abstraction-Platform/internal/lib"
)

type WebService struct {
	Logger             intdomint.Logger
	OpenID             intdomint.OpenID
	Env                *intlib.EnvVariables
	WebsiteTemplate    intdomint.WebsiteTemplates
	PostgresRepository *intrepopostgres.PostrgresRepository
	IamCookie          http.Cookie
}
