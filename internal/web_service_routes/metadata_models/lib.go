package metadatamodels

import (
	"context"

	intpkglib "github.com/icipe-official/Data-Abstraction-Platform/internal/pkg/lib"
	intpkgwebsite "github.com/icipe-official/Data-Abstraction-Platform/internal/pkg/website"
)

type requestResponseContextData struct {
	HTMLIsPartialRequest         string
	HTMLPartialName              string
	HTMLContent                  string
	WebService                   *intpkglib.WebService
	Context                      context.Context
	HTMLMetadataModelPageContext *HTMLMetadataModelPageContext
}

type HTMLMetadataModelPageContext struct {
	intpkgwebsite.RoutesContext
	Context struct {
		Error   intpkgwebsite.HTMLErrorContext
		Context struct {
			Error intpkgwebsite.HTMLErrorContext
			Data  string
		}
	}
}
