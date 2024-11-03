package database

import (
	"context"
	"fmt"
	"os"
	"strconv"

	pgxuuid "github.com/jackc/pgx-gofrs-uuid"
	pgxdecimal "github.com/jackc/pgx-shopspring-decimal"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/redis/go-redis/v9"
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

func NewRedisClient() (*redis.Client, error) {
	redisOptions := redis.Options{}
	if redisHost := os.Getenv("REDIS_HOST_PORT"); len(redisHost) > 0 {
		redisOptions.Addr = redisHost
	} else {
		return nil, fmt.Errorf("env variable REDIS_HOST_PORT not set")
	}
	if redisPassword := os.Getenv("REDIS_PASSWORD"); len(redisPassword) > 0 {
		redisOptions.Password = redisPassword
	}
	if redisDb, err := strconv.Atoi(os.Getenv("REDIS_DB")); err != nil {
		redisOptions.DB = redisDb
	}

	return redis.NewClient(&redisOptions), nil
}
