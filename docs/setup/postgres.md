# Postgres

The following bash script sample assumes a [Container Engine](../docs/setup/README.md) is already installed. Command may work using `docker` by replacing `podman`. EDIT APPROPRIATELY.

```sh
#!/bin/bash

POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres2024
HOST_PORT=5432
HOST_PATH=/home/user/postgres # where to store data
CONTAINER_IP=10.88.0.100
CONTAINER_IMAGE=docker.io/postgis/postgis:17-3.5
CONTAINER_NAME=postgis17.3.5
CPU=2
MEMORY=4gb

sudo podman run -d \
  -e POSTGRES_USER=$POSTGRES_USER -e POSTGRES_PASSWORD=$POSTGRES_PASSWORD \
  -p $HOST_PORT:5432 \
  -v $HOST_PATH:/var/lib/postgresql/data \
  --ip $CONTAINER_IP \
  --name $CONTAINER_NAME \
  --cpus $CPU \
  --memory $MEMORY \
  $CONTAINER_IMAGE
```