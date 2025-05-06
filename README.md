# Data Administration Platform

A web based platform with the goal of giving people the ability to prepare, collect, and explore data.

Key components are the [website](web/README.md) and the [backend](BACKEND.md).

## Dependencies

Recommended development and production OS environment is Linux.

### Required

1. Postgres 16 and above - Main database [(container version here)](https://hub.docker.com/_/postgres).
2. Redis stack 7.2.0-v10 and above - Cache database. Container version with redis insights [here](https://hub.docker.com/r/redis/redis-stack) and without [here](https://hub.docker.com/r/redis/redis-stack-server).
3. golang-migrate-cli - For running database migrations. Installation options as follows:

   - Install the binary release version for your specific OS [here](https://github.com/golang-migrate/migrate/releases).

   - (Recommended) Shell script that will download the linux version into `bin/` folder in current working directory is [here](scripts/download_golang_migrate.sh). Will be donwloaded automatically into the `bin/` folder when executing script to [build container image](scripts/build_container_images.sh) if it does not exist so as to place a version of it in the container.

4. [go](https://go.dev/dl/) version 1.22.1 or above.
5. [Node](https://nodejs.org/en) version 20 or above.
6. OpenID provider

### Optional

1. PgAdmin - a ui for administering postgres database [(container version here)](https://hub.docker.com/r/dpage/pgadmin4/).
2. Bruno - tool for api testing. Can be found [here](https://www.usebruno.com/downloads).

## Platform Version 1

### Add submodules for V1

1. git submodule init
2. git submodule update
