#!/bin/bash

set -e # terminate script if commands fail

bash scripts/psql_migrate_database.sh
bash scripts/cmd_app_init_database.sh

bin/web_service