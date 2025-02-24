package initdatabase

import intdomint "github.com/icipe-official/Data-Abstraction-Platform/internal/domain/interfaces"

type CmdInitDatabaseService struct {
	repo intdomint.InitDatabaseRepository
}

func NewCmdInitDatabaseService(repo intdomint.InitDatabaseRepository) *CmdInitDatabaseService {
	return &CmdInitDatabaseService{repo: repo}
}
