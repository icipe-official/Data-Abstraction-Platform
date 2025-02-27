package initdatabase

import intdomint "github.com/icipe-official/Data-Abstraction-Platform/internal/domain/interfaces"

type CmdInitDatabaseService struct {
	repo   intdomint.InitDatabaseRepository
	logger intdomint.Logger
}

func NewCmdInitDatabaseService(repo intdomint.InitDatabaseRepository, logger intdomint.Logger) *CmdInitDatabaseService {
	return &CmdInitDatabaseService{
		repo:   repo,
		logger: logger,
	}
}
