package cmdappcreatesuperuser

import intdomint "github.com/icipe-official/Data-Abstraction-Platform/internal/domain/interfaces"

type CmdCreateSuperUserService struct {
	repo intdomint.CreateSuperUserRepository
}

func NewCmdCreateSuperUserService(repo intdomint.CreateSuperUserRepository) *CmdCreateSuperUserService {
	return &CmdCreateSuperUserService{repo: repo}
}
