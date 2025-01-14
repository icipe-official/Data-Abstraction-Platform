# Executing containers
May work in docker as well, replace `podman` with `docker`.

## Postgis
Create postgis container:
```sh
# Replace with appropriate values
$POSTGRES_USER=postgres
$POSTGRES_PASSWORD=postgres2024
$HOST_PORT=5400
$HOST_PATH=
$CONTAINER_IP=10.88.0.100
$CONTAINER_IMAGE=docker.io/postgis/postgis:17-3.5

sudo podman run -d \
    -e POSTGRES_USER=$POSTGRES_USER -e POSTGRES_PASSWORD=$POSTGRES_PASSWORD \
    -p $HOST_PORT:5432 \ # (optional)
    -v $HOST_PATH:/var/lib/postgresql/data \ # Mount at specific path (optional)
    --ip $CONTAINER_IP \ # Static IP of container (optional)
    --name postgis17.3.5 \ # Container name (optional)
    $CONTAINER_IMAGE
```

## Pgadmin
Create pgadmin container:
```sh
# Replace with appropriate values
$PGADMIN_DEFAULT_EMAIL=postgres
$PGADMIN_DEFAULT_PASSWORD=postgres2024
$HOST_PORT=5500
$CONTAINER_IP=10.88.0.50
$CONTAINER_IMAGE=docker.io/dpage/pgadmin4:8.12.0

sudo podman run -d \
    -e PGADMIN_DEFAULT_EMAIL=$PGADMIN_DEFAULT_EMAIL -e PGADMIN_DEFAULT_PASSWORD=$PGADMIN_DEFAULT_EMAIL \
    -p $HOST_PORT:80 \ # (optional)
    --ip $CONTAINER_IP \ # Static IP of container (optional)
    --name pgadmin8.12.0 \ # Container name (optional)
    $CONTAINER_IMAGE
```

## Keycloak
Create keycloak container (ensure image was built with sudo):
```sh
# Replace with appropriate values
$KC_BOOTSTRAP_ADMIN_USERNAME=keycloak
$KC_BOOTSTRAP_ADMIN_PASSWORD=keycloak
$KC_HTTP_PORT=8080
$KC_HTTP_MANAGEMENT_PORT=9000
$KC_PROXY=edge
$CONTAINER_IP=10.88.0.200
$CONTAINER_IMAGE=localhost/data_abstraction_platform/keycloak:latest

sudo podman run -d \
    -e KC_BOOTSTRAP_ADMIN_USERNAME=$KC_BOOTSTRAP_ADMIN_USERNAME -e KC_BOOTSTRAP_ADMIN_PASSWORD=$KC_BOOTSTRAP_ADMIN_PASSWORD \
    -e KC_HTTP_PORT=$KC_HTTP_PORT -e KC_HTTP_MANAGEMENT_PORT=$KC_HTTP_MANAGEMENT_PORT -e KC_PROXY=$KC_PROXY \
    -p $KC_HTTP_PORT:$KC_HTTP_PORT -p $KC_HTTP_MANAGEMENT_PORT:$KC_HTTP_MANAGEMENT_PORT \ # (optional)
    --ip $CONTAINER_IP \ # Static IP of container (optional)
    --name keycloak26.0 \ # Container name (optional)
    $CONTAINER_IMAGE
    start --optimized --hostname=http://10.88.0.200:8080
```

To create a permanent admin user, follow the instructions found [here](https://github.com/keycloak/keycloak/discussions/33803#discussioncomment-10921141).