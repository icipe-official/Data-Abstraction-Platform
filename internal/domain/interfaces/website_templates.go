package interfaces

import "context"

type WebsiteTemplates interface {
	WebsiteTemplateSetBaseTemplate(template any) error
	WebsiteTemplateResetBaseTemplate()
	WebsiteTemplateRegisterPartialFile(ctx context.Context, templateName string, partialName string) error
	WebsiteTemplateParseFile(ctx context.Context, templateName string) (any, error)
	WebstieTemplateGetHtmlContext(ctx context.Context, data any) (string, error)
}
