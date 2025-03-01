package iam

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
	"net/http"

	intdoment "github.com/icipe-official/Data-Abstraction-Platform/internal/domain/entities"
	intdomint "github.com/icipe-official/Data-Abstraction-Platform/internal/domain/interfaces"
	inthttp "github.com/icipe-official/Data-Abstraction-Platform/internal/interfaces/http"
	intlib "github.com/icipe-official/Data-Abstraction-Platform/internal/lib"
)

type service struct {
	repo   intdomint.RouteIamRepository
	logger intdomint.Logger
}

func NewService(webService *inthttp.WebService) (*service, error) {
	n := new(service)

	n.repo = webService.PostgresRepository
	n.logger = webService.Logger

	if n.logger == nil {
		return n, errors.New("webService.Logger is empty")
	}

	if n.repo == nil {
		return n, errors.New("webService.PostgresRepository is empty")
	}

	return n, nil
}

func (n *service) ServiceOpenIDRevokeToken(ctx context.Context, openid intdomint.OpenID, token *intdoment.OpenIDToken) error {
	if err := openid.OpenIDRevokeToken(token); err != nil {
		n.logger.Log(ctx, slog.LevelError, fmt.Sprintf("revoke open id token failed, error: %v", err), intlib.FunctionName(n.ServiceOpenIDRevokeToken))
		return intlib.NewError(http.StatusInternalServerError, http.StatusText(http.StatusInternalServerError))
	}
	return nil
}

func (n *service) ServiceGetIamCredentialsByOpenIDSub(ctx context.Context, openIDTokenIntrospect *intdoment.OpenIDTokenIntrospect) (*intdoment.IamCredentials, error) {
	iamCredentials, err := n.repo.RepoIamCredentialsFindOneByID(ctx, intdoment.IamCredentialsRepository().OpenidSub, openIDTokenIntrospect.Sub, []string{intdoment.IamCredentialsRepository().ID, intdoment.IamCredentialsRepository().DeactivatedOn})
	if err != nil {
		n.logger.Log(ctx, slog.LevelError, intlib.FunctionNameAndError(n.ServiceGetIamCredentialsByOpenIDSub, err).Error())
		return nil, intlib.NewError(http.StatusInternalServerError, http.StatusText(http.StatusInternalServerError))
	}

	if iamCredentials != nil {
		if len(iamCredentials.DeactivatedOn) == 1 && !iamCredentials.DeactivatedOn[0].IsZero() {
			return nil, intlib.NewError(http.StatusForbidden, http.StatusText(http.StatusForbidden))
		}
		return iamCredentials, nil
	}

	//TODO: Create new iamCredential?
	return nil, intlib.NewError(http.StatusNotFound, http.StatusText(http.StatusNotFound))
}

func (n *service) ServiceOpenIDIntrospectToken(ctx context.Context, openid intdomint.OpenID, token *intdoment.OpenIDToken) (*intdoment.OpenIDTokenIntrospect, error) {
	if value, err := openid.OpenIDIntrospectToken(token); err != nil {
		n.logger.Log(ctx, slog.LevelError, fmt.Sprintf("revoke open id token failed, error: %v", err), intlib.FunctionName(n.ServiceOpenIDIntrospectToken))
		return nil, intlib.NewError(http.StatusInternalServerError, http.StatusText(http.StatusInternalServerError))
	} else {
		return value, nil
	}
}
