# Backend

A collection of applications with the main goal is to run a http server which will offer API services as well as serve the [website](web/README.md). Contains a set of applications that serve different purposes as follows:

- [cmd_app_create_super_user](cmd/cmd_app_create_super_user/main.go) - cli app to create a system user with all the roles in the system.
- [cmd_app_init_database](cmd/cmd_app_init_database/main.go) - cli app to initialize database with default values.
- [web_service](cmd/web_service/main.go) - http server that combines all the remaining services into one.

## Environment variables

Template shell script to set env variables in current shell session can be found [here](configs/env.sh.template).

Applications ran will highlight the different environment variables required if they are not set.

- `WEB_SERVICE_CORS_URLS`: Used for cors. Use space to separate multiple urls. Example: `https://localhost:5173 www.data-abstraction-platform.com`.
- `WEB_SERVICE_APP_PREFIX`: Used for redis keys. Will enable sharing of redis instances.
- `WEB_SERVICE_PORT`: Port that [web_service](cmd/web_service/main.go) will run on.
- `WEB_SERVICE_BASE_PATH`: Set if web_services are to be hosted on its own base/sub path whilst using a shared domain. [Website](web/README.md) will require re-build if this value changes.

- `VITE_WEBSITE_LOG_LEVEL`: [website](web/README.md) log levels. 0 - Debug, 1 - Warning, 2 - Error.
- `VITE_WEBSITE_TITLE`: Title of the [website](web/README.md).
- `VITE_WEB_SERVICE_API_CORE_URL`: Full URL to the api portion of the backend. E.g. `http://localhost:5173/api`.

- `PSQL_DATABASE_URI`: Postgres connection string. E.g. `postgres://postgres:password@localhost:5432/example_database?sslmode=disable`. Refer to the article [here](https://www.prisma.io/dataguide/postgresql/
short-guides/connection-uris) on how to create a postgres connection string.
- `PSQL_DATABASE_MIGRATION_SCRIPTS_DIRECTORY`: Defaults to [`database/psql_database_migrations_scripts`](database/psql_database_migrations_scripts). Directory where postgresql migration scripts are stored.

- `MAIL_HOST`
- `MAIL_PORT`
- `MAIL_USERNAME`
- `MAIL_PASSWORD`

- `IAM_ENCRYPTION_KEY`: Secret key used to encrypt the access and refresh tokens. Key MUST be 16, 24, or 32 characters in length ONLY. You can use [openssl](#miscellaneous).
- `IAM_ENCRYPT_TOKENS`: Defaults to `true`. Set to `false` if openid provider already encrypts the token.
- `IAM_COOKIE_HTTP_ONLY`: Defaults to `true`.
- `IAM_COOKIE_SAME_SITE`: Defaults to `3`. 1 for `SameSiteDefaultMode`, 2 for `SameSiteLaxMode`, 3 for `SameSiteStrictMode` (preferred), 4 for `SameSiteNoneMode`.
- `IAM_COOKIE_SECURE`: Defaults to `true`. Set to `false` for development.
- `IAM_COOKIE_DOMAIN`: Value should be similar to WEB_APP_URL in production. Example: `localhost:5173`.

- `LOG_LEVEL`: Default is `1`. On a scale/range: debug(-4 to -1), info(0 to 3), warning(4 to 7), error(8).
- `LOG_USE_JSON`: Default is `false`. Emit logs in json format.
- `LOG_COINCISE`: Default is `true`. Emit non-detailed logs which excludes info like some http request details.
- `LOG_REQUEST_HEADERS`: Default is `true`. Logs should include http request details.
- `LOG_APP_VERSION`: Version of the deployed applications.

- `WEBSITE_DIRECTORY`: Defaults to `dist/` folder under [`web`](web/). Folder `dist/` is generated after building the website or running it in dev mode. More information [here](web/README.md).
## Development

Setup the [website](web/README.md) in [development mode](web/README.md#development) to access the website via a browser.

Compilation of [cmd](cmd/) executables not necessary since it is development (go will automatically compile the apps and run them).

### Install go dependencies.

```sh
go mod tidy
```

## Running the backend
1. Run the database migrations.
2. Initialize the database.
3. Create a super user (first time).
4. Run the web_service.

## Database migrations

### Migrate CLI Commands

Migration scripts are located [here](database/psql_database_migrations_scripts).

If the `migrate` cli was downloaded using the linux shell script and is available in the [bin](bin/) directory, replace `migrate` with `bin/migrate` in the below commands.

Run all migrations:

```sh
# $PSQL_DATABASE_MIGRATION_SCRIPTS_DIRECTORY points to `database/psql_database_migrations_scripts`

migrate -path $PSQL_DATABASE_MIGRATION_SCRIPTS_DIRECTORY -database $PSQL_DATABASE_URI up
```

Other migration commands:

```sh
# $PSQL_DATABASE_MIGRATION_SCRIPTS_DIRECTORY points to `database/psql_database_migrations_scripts`


# Create new migration with the name $MIGRATIONS_NAME
migrate create -ext sql -dir $PSQL_DATABASE_MIGRATION_SCRIPTS_DIRECTORY $MIGRATIONS_NAME


# Revert $NO_OF_MIGRATIONS_TO_REVERT number of migrations
migrate -path $PSQL_DATABASE_MIGRATION_SCRIPTS_DIRECTORY -database $PSQL_DATABASE_URI down $NO_OF_MIGRATIONS_TO_REVERT


# Fix dirty migration
migrate -path $PSQL_DATABASE_MIGRATION_SCRIPTS_DIRECTORY -database $PSQL_DATABASE_URI force $EXISTING_VERSION_OF_MIGRATION
```

## Production

### Using container images

Install [docker](https://www.docker.com/get-started/) or [podman](https://podman.io/docs/installation).

```sh
# Build all container images

# Replace with appropriate values
$CONTAINER_IMAGE_TAG=latest # Defaults to latest
$CONTAINER_CLI=podman # Defaults to docker

bash scripts/build_container_images.sh -t $CONTAINER_IMAGE_TAG -c $CONTAINER_CLI
```

### Using executables

Compile and generate [cmd](cmd/) executabes. The executables with be stored in the `bin/` folder.

```sh
    bash scripts/build_cmd_app_create_super_user.sh
    bash scripts/build_cmd_app_init_database.sh
    bash scripts/build_web_service.sh

```

## Initializing the database

Initialize database with default values such as default model_templates and authorization rules by running the init_database cli.

```sh
# In development
go run cmd/cmd_app_init_database/main.go

# In production after building the executable
bin/cmd_app_init_database
```

## Create super user

Following the command prompts after running the cmd_app_create_super_user cli:

```sh
# In development
go run cmd/cmd_app_create_super_user/main.go

#In production after buildling the executable
bin/cmd_app_create_super_user
```

## Build keycloak image
Setup keycloak as an OpenID provider if no external provider is available.

NB. Ensure postgres instance exists and is set up.

Create your own `Dockerfile.keycloak` based on the [`Dockerfile.keycloak.template`](build/Dockerfile.keycloak.template) and edit the `ENV` values appropriately.

Build the container image
```sh
# Replace with appropriate values
$CONTAINER_IMAGE_TAG=latest # Defaults to latest
$CONTAINER_CLI=podman # Defaults to docker

bash scripts/build_keycloak_image.sh -t $CONTAINER_IMAGE_TAG -c $CONTAINER_CLI
```

## Run the web_service

```sh
# In development
go run cmd/web_service/main.go

#In production after buildling the executable
bin/web_service
```

## Miscellaneous

Generate random values using openssl.

```sh
    # Replace $LENGTH_OF_KEY with desired number

   openssl rand -base64 $LENGTH_OF_KEY
```
