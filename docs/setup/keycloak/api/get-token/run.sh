#!/bin/bash

# Setup Environment Variables

# Global
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PATH_TO_INIT_ENV="$SCRIPT_DIR/../init_env.sh"
source $PATH_TO_INIT_ENV

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Local
PATH_TO_ENV="$SCRIPT_DIR/env.sh"

if [ ! -f "$PATH_TO_ENV" ]; then
    echo "ERROR: $PATH_TO_ENV does not exist."
    exit 1
fi

source $PATH_TO_ENV

# Build cURL command

CURL_COMMAND="curl"

OPTIONS=$(getopt -o '' -l "verbose,output-json,refresh" -n "script_name" -- "$@")

if [[ $? -ne 0 ]]; then
  echo "Error in command line arguments." >&2
  exit 1
fi

VERBOSE=false
OUTPUT_JSON=false
REFRESH=false
while true; do
    case "$1" in
        --verbose)
            CURL_COMMAND="$CURL_COMMAND -v"
            VERBOSE=true
            shift
            ;;
        --output-json)
            OUTPUT_JSON=true
            shift
            ;;
        --refresh)
            REFRESH=true
            shift
            ;;
        --)
            shift
            break
            ;;
        *)
            break
            ;;
    esac
done

# # Setup Form Data

if [ "$REFRESH" = false ]; then
    echo
    echo "...signing in..."
    echo
    if [ -z "$USERNAME" ]; then
        echo "ERROR: Please set USERNAME enviroment variable in env.sh"
        exit 1
    else
        CURL_COMMAND="$CURL_COMMAND --data 'username=$USERNAME'"
    fi

    if [ -z "$PASSWORD" ]; then
        echo "ERROR: Please set PASSWORD enviroment variable in env.sh"
        exit 1
    else
        CURL_COMMAND="$CURL_COMMAND --data 'password=$PASSWORD'"
    fi

    if [ -z "$SCOPE" ]; then
        echo "ERROR: Please set SCOPE enviroment variable in env.sh"
        exit 1
    else
        CURL_COMMAND="$CURL_COMMAND --data 'scope=$SCOPE'"
    fi

    if [ -z "$GRANT_TYPE" ]; then
        echo "ERROR: Please set GRANT_TYPE enviroment variable in env.sh"
        exit 1
    else
        CURL_COMMAND="$CURL_COMMAND --data 'grant_type=$GRANT_TYPE'"
    fi
else
    echo
    echo "...refreshing token..."
    echo

    # Refresh Token
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    PATH_TO_INIT_REFRESH_TOKEN="$SCRIPT_DIR/../init_refresh_token.sh"
    source $PATH_TO_INIT_REFRESH_TOKEN

    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

    if [ -z "$REFRESH_TOKEN" ]; then
        echo "ERROR: Please set REFRESH_TOKEN enviroment variable in env.sh"
        exit 1
    else
        CURL_COMMAND="$CURL_COMMAND --data 'refresh_token=$REFRESH_TOKEN'"
    fi

    CURL_COMMAND="$CURL_COMMAND --data 'grant_type=refresh_token'"
fi

if [ -z "$CLIENT_ID" ]; then
    echo "ERROR: Please set CLIENT_ID enviroment variable in env.sh"
    exit 1
else
    CURL_COMMAND="$CURL_COMMAND --data 'client_id=$CLIENT_ID'"
fi
if [ -z "$CLIENT_SECRET" ]; then
    echo "ERROR: Please set CLIENT_SECRET enviroment variable in env.sh"
    exit 1
else
    CURL_COMMAND="$CURL_COMMAND --data 'client_secret=$CLIENT_SECRET'"
fi

if [ -z "$HTTP_PATH" ]; then
    HTTP_PATH="/protocol/openid-connect/revoke"
fi

CURL_COMMAND="$CURL_COMMAND -X POST -H 'Content-Type: application/x-www-form-urlencoded' -H 'Accept: application/json' --url $OPEN_ID_ISSUER_URL$HTTP_PATH"

if [ "$VERBOSE" = true ]; then
    echo "cURL command begin..."
    echo
    echo $CURL_COMMAND
    echo
    echo "...cURL commmand end"
    echo
fi

# Execute cURL command

if [ "$OUTPUT_JSON" = true ]; then
    eval $CURL_COMMAND > $SCRIPT_DIR/output.json
else
    eval $CURL_COMMAND
fi

echo