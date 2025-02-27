package interfaces

import (
	"context"
)

type RouteMetadataModelsRepository interface {
}

type RouteMetadataModelsApiService interface {
}

type RouteMetadataModelsWebsiteService interface {
	ServiceGetMedataModelPageHtml(ctx context.Context, websiteTemplate WebsiteTemplates, openid OpenID, partialRequest bool, partialName string) (*string, error)
}
