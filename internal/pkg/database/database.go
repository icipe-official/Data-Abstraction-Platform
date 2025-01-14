package database

import (
	"context"
	"os"

	pgxuuid "github.com/jackc/pgx-gofrs-uuid"
	pgxdecimal "github.com/jackc/pgx-shopspring-decimal"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

func NewPgxPool(ctx context.Context) (*pgxpool.Pool, error) {
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
		return dpool, nil
	}
}
