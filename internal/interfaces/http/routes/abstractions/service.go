package abstractions

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
	"net/http"

	"github.com/gofrs/uuid/v5"

	intdomint "github.com/icipe-official/Data-Abstraction-Platform/internal/domain/interfaces"
	inthttp "github.com/icipe-official/Data-Abstraction-Platform/internal/interfaces/http"
	intlib "github.com/icipe-official/Data-Abstraction-Platform/internal/lib"
)

func (n *service) ServiceAbstractionsMetadataModelGet(ctx context.Context, directoryGroupID uuid.UUID) (map[string]any, error) {
	if value, err := n.repo.RepoMetadataModelFindOneByAbstractionsDirectoryGroupsID(ctx, directoryGroupID); err != nil {
		n.logger.Log(ctx, slog.LevelError, fmt.Sprintf("Get metadata-model failed, error: %v", err), intlib.FunctionName(n.ServiceAbstractionsMetadataModelGet))
		return nil, intlib.NewError(http.StatusInternalServerError, http.StatusText(http.StatusInternalServerError))
	} else {
		if value == nil {
			return nil, intlib.NewError(http.StatusNotFound, http.StatusText(http.StatusNotFound))
		}
		return value, nil
	}
}

type service struct {
	repo   intdomint.RouteAbstractionsRepository
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
