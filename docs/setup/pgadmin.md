# PgAdmin

The following bash script sample assumes a [Container Engine](../docs/setup/README.md) is already installed. Command may work using `docker` by replacing `podman`. EDIT APPROPRIATELY.

```sh
#!/bin/bash

PGADMIN_DEFAULT_EMAIL=admin@pgadmin.org
PGADMIN_DEFAULT_PASSWORD=pgadmin2024
PGADMIN_SCRIPT_NAME=/pgadmin #REMOVE as well as corresponding env if pgadmin will not be hosted on a subpath
HOST_PORT=5433
HOST_PATH=/home/user/pgadmin
CONTAINER_IP=10.88.0.50
CONTAINER_IMAGE=docker.io/dpage/pgadmin4:8.12.0
CPU=2
MEMORY=4gb

sudo podman run -d \
    -e PGADMIN_DEFAULT_EMAIL=$PGADMIN_DEFAULT_EMAIL -e PGADMIN_DEFAULT_PASSWORD=$PGADMIN_DEFAULT_PASSWORD -e SCRIPT_NAME=$PGADMIN_SCRIPT_NAME \
    -p $HOST_PORT:80 \
    --ip $CONTAINER_IP \
    -v $HOST_PATH:/var/lib/pgadmin \
    --name pgadmin8.12.0 \
    --cpus $CPU \
    --memory $MEMORY \
    $CONTAINER_IMAGE
```