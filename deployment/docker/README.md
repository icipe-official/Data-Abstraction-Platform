# Executing containers
May work in docker as well, replace `podman` with `docker`.

## Nginx
Create nginx container:
```sh
# Replace with appropriate values
NGINX_VERSION=1.27.2
NGINX_443_PORT=443
NGINX_80_PORT=80
NGINX_CONFIG_PATH=/home/declan/Data-Abstraction-Platform/_ignore/nginx/nginx.conf
NGINX_SITES_ENABLED_PATH=/home/declan/Data-Abstraction-Platform/_ignore/nginx/sites-enabled
NGINX_CERTIFICATES_PATH=/home/declan/Data-Abstraction-Platform/_ignore/certificates
CONTAINER_IP=0.0.0.0
CONTAINER_IMAGE=docker.io/nginx:1.27.2
CPU=2
MEMORY=4gb

# Remove comments in the command below
sudo podman run -d \
    -p $NGINX_443_PORT:443 \ # (optional)
    -p $NGINX_80_PORT:80 \ # (optional)
    -v $NGINX_CONFIG_PATH: /etc/nginx/nginx.conf
    -v $NGINX_SITES_ENABLED_PATH:/etc/nginx/sites-enabled
    -v $NGINX_CERTIFICATES_PATH:/certificates
    --cpus $CPU \
    --memory $MEMORY \
    --ip $CONTAINER_IP \ # Static IP of container (optional)
    --name nginx1.27.2 \ # Container name (optional)
    $CONTAINER_IMAGE
```

## Postgis
Create postgis container:
```sh
# Replace with appropriate values
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres2024
HOST_PORT=5400
HOST_PATH=
CONTAINER_IP=10.88.0.100
CONTAINER_IMAGE=docker.io/postgis/postgis:17-3.5

# Remove comments in the command below
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
PGADMIN_DEFAULT_EMAIL=postgres
PGADMIN_DEFAULT_PASSWORD=postgres2024
HOST_PORT=5500
CONTAINER_IP=10.88.0.50
CONTAINER_IMAGE=docker.io/dpage/pgadmin4:8.12.0

# Remove comments in the command below
sudo podman run -d \
    -e PGADMIN_DEFAULT_EMAIL=$PGADMIN_DEFAULT_EMAIL -e PGADMIN_DEFAULT_PASSWORD=$PGADMIN_DEFAULT_PASSWORD \
    -p $HOST_PORT:80 \ # (optional)
    --ip $CONTAINER_IP \ # Static IP of container (optional)
    --name pgadmin8.12.0 \ # Container name (optional)
    $CONTAINER_IMAGE
```

## Keycloak
Create keycloak container (ensure image was built with sudo):
```sh
# Replace with appropriate values
KC_BOOTSTRAP_ADMIN_USERNAME=keycloak
KC_BOOTSTRAP_ADMIN_PASSWORD=keycloak
KC_HTTP_PORT=8080
KC_HTTP_MANAGEMENT_PORT=9000
KC_PROXY=edge
CONTAINER_IP=10.88.0.200
CONTAINER_IMAGE=localhost/data_abstraction_platform/keycloak:latest
CPU=2
MEMORY=4gb

# Non optimized mode (Allows path change on the fly without container rebuild)
# Remove comments in the command below
sudo podman run -d \
    -e KC_BOOTSTRAP_ADMIN_USERNAME=$KC_BOOTSTRAP_ADMIN_USERNAME -e KC_BOOTSTRAP_ADMIN_PASSWORD=$KC_BOOTSTRAP_ADMIN_PASSWORD \
    -e KC_HTTP_PORT=$KC_HTTP_PORT -e KC_HTTP_MANAGEMENT_PORT=$KC_HTTP_MANAGEMENT_PORT \
    -p $KC_HTTP_PORT:$KC_HTTP_PORT -p $KC_HTTP_MANAGEMENT_PORT:$KC_HTTP_MANAGEMENT_PORT \
    --ip $CONTAINER_IP \
    --name keycloak26.0 \
    --cpus $CPU \
    --memory $MEMORY \
    $CONTAINER_IMAGE \
    start --hostname https://test-dmmg.icipe.org/keycloak --hostname-debug true --http-enabled true --proxy-headers xforwarded --http-relative-path /keycloak

# Optimized mode
# Remove comments in the command below
sudo podman run -d \
    -e KC_BOOTSTRAP_ADMIN_USERNAME=$KC_BOOTSTRAP_ADMIN_USERNAME -e KC_BOOTSTRAP_ADMIN_PASSWORD=$KC_BOOTSTRAP_ADMIN_PASSWORD \
    -e KC_HTTP_PORT=$KC_HTTP_PORT -e KC_HTTP_MANAGEMENT_PORT=$KC_HTTP_MANAGEMENT_PORT -e KC_PROXY=$KC_PROXY \
    -p $KC_HTTP_PORT:$KC_HTTP_PORT -p $KC_HTTP_MANAGEMENT_PORT:$KC_HTTP_MANAGEMENT_PORT \ # (optional)
    --ip $CONTAINER_IP \ # Static IP of container (optional)
    --name keycloak26.0 \ # Container name (optional)
    $CONTAINER_IMAGE \
    start --optimized --hostname=http://10.88.0.200:8080
```

To create a permanent admin user, follow the instructions found [here](https://github.com/keycloak/keycloak/discussions/33803#discussioncomment-10921141).

## Cerbot let's encrypt certificate generation
NB. This method requires port `443` and `80` to be available. Services like nginx should not be running during certificate generation.

```sh
CERTBOT_443_PORT=443
CERTBOT_80_PORT=80
ETC_PATH=
LIB_PATH=
CONTAINER_IMAGE=docker.io/certbot/certbot:latest

sudo podman run -it --rm --name certbot \
    -v $ETC_PATH:/etc/letsencrypt \
    -v $LIB_PATH:/var/lib/letsencrypt \
    -p $CERTBOT_443_PORT:443 \
    -p $CERTBOT_80_PORT:80 \
    $CONTAINER_IMAGE certonly
```