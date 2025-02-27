package postgres

import (
	"context"
	"fmt"
	"os"
	"strings"

	intdomint "github.com/icipe-official/Data-Abstraction-Platform/internal/domain/interfaces"
	pgxuuid "github.com/jackc/pgx-gofrs-uuid"
	pgxdecimal "github.com/jackc/pgx-shopspring-decimal"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type PostrgresRepository struct {
	db     *pgxpool.Pool
	logger intdomint.Logger
}

func NewPostgresRepository(ctx context.Context, logger intdomint.Logger) (*PostrgresRepository, error) {
	dbConfig, err := pgxpool.ParseConfig(os.Getenv("PSQL_DATABASE_URI"))
	if err != nil {
		return nil, err
	}
	dbConfig.AfterConnect = func(ctx context.Context, conn *pgx.Conn) error {
		pgxuuid.Register(conn.TypeMap())
		pgxdecimal.Register(conn.TypeMap())
		return nil
	}
	if dpool, err := pgxpool.NewWithConfig(ctx, dbConfig); err != nil {
		return nil, err
	} else {
		return &PostrgresRepository{
			db:     dpool,
			logger: logger,
		}, nil
	}
}

func (n *PostrgresRepository) Ping(ctx context.Context) error {
	if err := n.db.Ping(ctx); err != nil {
		return err
	}

	return nil
}

func GetFullTextSearchQuery(fullTextSearchColumn string, searchQuery string) string {
	sqSplitSpace := strings.Split(searchQuery, " ")
	if len(sqSplitSpace) > 0 {
		newQuery := fmt.Sprintf("%v @@ to_tsquery('%v:*')", fullTextSearchColumn, sqSplitSpace[0])
		for i := 1; i < len(sqSplitSpace); i++ {
			newQuery = newQuery + " AND " + fmt.Sprintf("%v @@ to_tsquery('%v:*')", fullTextSearchColumn, sqSplitSpace[i])
		}
		return newQuery
	} else {
		return fmt.Sprintf("%v @@ to_tsquery('%v:*')", fullTextSearchColumn, searchQuery)
	}
}

func GetandUpdateNextPlaceholder(nextPlaceholder *int) string {
	defer func() {
		*nextPlaceholder += 1
	}()
	return fmt.Sprintf("$%d", *nextPlaceholder)
}

func GetUpdateSetColumns(colums []string, nextPlaceholder *int) string {
	setColumns := make([]string, 0)
	for _, value := range colums {
		setColumns = append(setColumns, fmt.Sprintf("%s = $%d", value, *nextPlaceholder))
		*nextPlaceholder += 1
	}
	return strings.Join(setColumns, ", ")
}

func GetQueryPlaceholderString(noOfPlaceHolders int, nextPlaceholder *int) string {
	placeholders := make([]string, 0)
	for range noOfPlaceHolders {
		placeholders = append(placeholders, fmt.Sprintf("$%d", *nextPlaceholder))
		*nextPlaceholder += 1
	}
	return strings.Join(placeholders, ", ")
}
