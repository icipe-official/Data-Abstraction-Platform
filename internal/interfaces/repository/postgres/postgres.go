package postgres

import (
	"context"
	"os"

	pgxuuid "github.com/jackc/pgx-gofrs-uuid"
	pgxdecimal "github.com/jackc/pgx-shopspring-decimal"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type PostrgresRepository struct {
	db *pgxpool.Pool
}

func NewPostgresRepository(ctx context.Context) (*PostrgresRepository, error) {
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
			db: dpool,
		}, nil
	}
}
