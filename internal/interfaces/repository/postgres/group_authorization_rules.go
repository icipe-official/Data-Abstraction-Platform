package postgres

import (
	"context"
	"fmt"
	"log/slog"

	intdoment "github.com/icipe-official/Data-Abstraction-Platform/internal/domain/entities"
	intlib "github.com/icipe-official/Data-Abstraction-Platform/internal/lib"
)

func (n *PostrgresRepository) RepoGroupAuthorizationRulesUpsertMany(ctx context.Context, data []intdoment.GroupAuthorizationRules) (int, error) {
	query := fmt.Sprintf(
		"INSERT INTO %[1]s (%[2]s, %[3]s, %[4]s) VALUES ($1, $2, $3) ON CONFLICT(%[2]s, %[3]s) DO UPDATE SET %[4]s = $3;",
		intdoment.GroupAuthorizationRulesRepository().RepositoryName, //1
		intdoment.GroupAuthorizationRulesRepository().ID,             //2
		intdoment.GroupAuthorizationRulesRepository().RuleGroup,      //3
		intdoment.GroupAuthorizationRulesRepository().Description,    //4
	)
	n.logger.Log(ctx, slog.LevelDebug, query, "function", intlib.FunctionName(n.RepoGroupAuthorizationRulesUpsertMany))

	successfulUpserts := 0
	for _, datum := range data {
		if _, err := n.db.Exec(ctx, query, datum.GroupAuthorizationRulesID[0].ID[0], datum.GroupAuthorizationRulesID[0].RuleGroup[0], datum.Description[0]); err != nil {
			return successfulUpserts, intlib.FunctionNameAndError(n.RepoGroupAuthorizationRulesUpsertMany, err)
		}
		successfulUpserts += 1
	}

	return successfulUpserts, nil
}
