package handlebars

import (
	"context"
	"errors"
	"fmt"
	"log/slog"

	"github.com/aymerick/raymond"
	intdomint "github.com/icipe-official/Data-Abstraction-Platform/internal/domain/interfaces"
	intlib "github.com/icipe-official/Data-Abstraction-Platform/internal/lib"
)

type HandleBarsWebisteTemplate struct {
	basetemplate *raymond.Template
	logger       intdomint.Logger
	htmlPages    map[string]string
	websiteDir   string
}

func NewHandleBarsTemplate(logger intdomint.Logger, websiteDir string, htmlPages map[string]string) *HandleBarsWebisteTemplate {
	return &HandleBarsWebisteTemplate{
		logger:     logger,
		htmlPages:  htmlPages,
		websiteDir: websiteDir,
	}
}

func (n *HandleBarsWebisteTemplate) WebsiteTemplateResetBaseTemplate() {
	n.basetemplate = nil
}

func (n *HandleBarsWebisteTemplate) WebsiteTemplateSetBaseTemplate(template any) error {
	if raymondTemplate, ok := template.(*raymond.Template); ok {
		n.basetemplate = raymondTemplate
	} else {
		return fmt.Errorf("expected template to be type *raymond.Template, found %T", template)
	}
	return nil
}

func (n *HandleBarsWebisteTemplate) WebsiteTemplateRegisterPartialFile(ctx context.Context, templateName string, partialName string) error {
	var err error

	if templateFilePath, ok := n.htmlPages[templateName]; ok {
		if err = n.basetemplate.RegisterPartialFile(n.websiteDir+templateFilePath, partialName); err != nil {
			err = fmt.Errorf("register template %v as partial with name %v failed | reason: %v", templateName, partialName, err)
			n.logger.Log(ctx, slog.LevelError, err.Error(), "function", intlib.FunctionName(n.WebsiteTemplateRegisterPartialFile))
			return err
		}
	} else {
		err = fmt.Errorf("get template property %v failed | reason: property does not exist", templateName)
		n.logger.Log(ctx, slog.LevelError, err.Error(), "function", intlib.FunctionName(n.WebsiteTemplateRegisterPartialFile))
		return err
	}
	return err
}

func (n *HandleBarsWebisteTemplate) WebsiteTemplateParseFile(ctx context.Context, templateName string) (any, error) {
	if templateFilePath, ok := n.htmlPages[templateName]; ok {
		if template, err := raymond.ParseFile(n.websiteDir + templateFilePath); err != nil {
			err = fmt.Errorf("get template %v failed, reason: %v", templateName, err)
			n.logger.Log(ctx, slog.LevelError, err.Error(), "function", intlib.FunctionName(n.WebsiteTemplateParseFile))
			return nil, err
		} else {
			return template, nil
		}
	} else {
		err := fmt.Errorf("template property %v does not exist", templateName)
		n.logger.Log(ctx, slog.LevelError, err.Error(), "function", intlib.FunctionName(n.WebsiteTemplateParseFile))
		return nil, err
	}
}

func (n *HandleBarsWebisteTemplate) WebstieTemplateGetHtmlContext(ctx context.Context, data any) (string, error) {
	if htmlContent, err := n.basetemplate.Exec(data); err != nil {
		n.logger.Log(ctx, slog.LevelError, err.Error(), "function", intlib.FunctionName(n.WebstieTemplateGetHtmlContext))
		return "", errors.New("parse template failed")
	} else {
		return htmlContent, nil
	}
}
