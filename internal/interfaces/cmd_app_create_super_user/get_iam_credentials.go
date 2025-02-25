package cmdappcreatesuperuser

import (
	"bufio"
	"context"
	"errors"
	"fmt"
	"os"

	intdoment "github.com/icipe-official/Data-Abstraction-Platform/internal/domain/entities"
)

func (n *CmdCreateSuperUserService) ServiceGetIamCredentials(ctx context.Context) (*intdoment.IamCredentials, error) {
	reader := bufio.NewReader(os.Stdin)

	fmt.Print("Choose how to get iam credentials(1-id, 2-openid_sub, 3-openid_preferred_username):")
	option, err := reader.ReadString('\n')
	if err != nil {
		return nil, errors.New("could not read chosen method to fetch iam credentials")
	}

	repoFieldColumnName := ""
	switch option {
	case "1":
		repoFieldColumnName = intdoment.IamCredentialsRepository().ID
	case "2":
		repoFieldColumnName = intdoment.IamCredentialsRepository().OpenidSub
	case "3":
		repoFieldColumnName = intdoment.IamCredentialsRepository().OpenidPreferredUsername
	default:
		return nil, errors.New("chosen method to fetch iam credentials not recognized")
	}

	iamCredential, err := n.repo.RepoIamCredentialsGetOneByColumnValueEquality(ctx, repoFieldColumnName)
	if err != nil {
		return nil, errors.New("could not read chosen method to fetch iam credentials")
	}
}
