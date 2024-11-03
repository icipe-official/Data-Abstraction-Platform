package lib

import (
	"github.com/go-chi/httplog/v2"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/redis/go-redis/v9"
)

type WebService struct {
	PgxPool     *pgxpool.Pool
	RedisClient *redis.Client
	Logger      *httplog.Logger
	HtmlPages   map[string]string
}
