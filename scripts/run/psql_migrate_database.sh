#!/bin/bash

set -e # terminate script if commands fail

echo "executing database migrations..."
bin/migrate -path $PSQL_DATABASE_MIGRATION_SCRIPTS_DIRECTORY -database $PSQL_DATABASE_URI up
echo "...migrations complete"