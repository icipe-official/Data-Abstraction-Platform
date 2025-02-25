package initdatabase

import (
	"context"
	"log"

	"github.com/go-chi/httplog/v2"
	intdoment "github.com/icipe-official/Data-Abstraction-Platform/internal/domain/entities"
	intlib "github.com/icipe-official/Data-Abstraction-Platform/internal/lib"
)

func (n *CmdInitDatabaseService) ServiceInitSystemDirectoryGroup(ctx context.Context, logger *httplog.Logger) error {
	systemGroup, err := n.repo.RepoDirectoryGroupsFindSystemGroup(ctx, logger, []string{intdoment.DirectoryGroupsRepository().ID})
	if err != nil {
		return intlib.FunctionNameAndError(n.ServiceInitSystemDirectoryGroup, err)
	}
	if systemGroup != nil {
		return nil
	}

	systemGroup, err = n.repo.RepoDirectoryGroupsCreateSystemGroup(ctx, logger, []string{intdoment.DirectoryGroupsRepository().ID})
	if err != nil {
		return intlib.FunctionNameAndError(n.ServiceInitSystemDirectoryGroup, err)
	}
	log.Printf("System Group with id %s created", systemGroup.ID[0])

	return nil
}
