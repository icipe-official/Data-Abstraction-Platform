#!/bin/bash

# Setup Environment Variables

# Global
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PATH_TO_INIT_ENV="$SCRIPT_DIR/../init_env.sh"
source $PATH_TO_INIT_ENV

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Access Token
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PATH_TO_INIT_ACCESS_TOKEN="$SCRIPT_DIR/../init_access_token.sh"
source $PATH_TO_INIT_ACCESS_TOKEN

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Local
PATH_TO_ENV="$SCRIPT_DIR/env.sh"

if [ -f "$PATH_TO_ENV" ]; then
    source $PATH_TO_ENV
fi

# Build cURL command

CURL_COMMAND="curl"

OPTIONS=$(getopt -o '' -l "verbose,output-json,inspect-refresh,inspect-access" -n "script_name" -- "$@")

if [[ $? -ne 0 ]]; then
  echo "Error in command line arguments." >&2
  exit 1
fi

VERBOSE=false
OUTPUT_JSON=false
INSPECT_ACCESS=false
INSPECT_REFRESH=false
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
        --inspect-refresh)
            INSPECT_ACCESS=true
            shift
            ;;
        --inspect-access)
            INSPECT_REFRESH=true
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
    HTTP_PATH="/protocol/openid-connect/token/introspect"
fi

if [ "$INSPECT_ACCESS" = false ] && [ "$INSPECT_REFRESH" = false ]; then
    INSPECT_ACCESS=true
    INSPECT_REFRESH=true
fi

CURL_COMMAND="$CURL_COMMAND -X POST -H 'Content-Type: application/x-www-form-urlencoded' -H 'Accept: application/json' --url $OPEN_ID_ISSUER_URL$HTTP_PATH"

if [ "$INSPECT_REFRESH" = true ]; then
    echo
    echo 'inspecting refresh_token...'
    echo

    # Refresh Token
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    PATH_TO_INIT_ACCESS_TOKEN="$SCRIPT_DIR/../init_refresh_token.sh"
    source $PATH_TO_INIT_ACCESS_TOKEN

    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

    REFRESH_CURL_COMMAND="$CURL_COMMAND"

    if [ -z "$REFRESH_TOKEN" ]; then
        echo "ERROR: Please set REFRESH_TOKEN enviroment variable in env.sh"
        exit 1
    else
        REFRESH_CURL_COMMAND="$REFRESH_CURL_COMMAND --data 'token=$REFRESH_TOKEN'"
    fi

    if [ "$VERBOSE" = true ]; then
        echo "cURL command begin..."
        echo
        echo $REFRESH_CURL_COMMAND
        echo
        echo "...cURL commmand end"
        echo
    fi


    # Execute cURL command

    if [ "$OUTPUT_JSON" = true ]; then
        eval $REFRESH_CURL_COMMAND > $SCRIPT_DIR/output_refresh.json
    else
        eval $REFRESH_CURL_COMMAND
    fi    

    echo
    echo '...complete'
    echo
fi

if [ "$INSPECT_ACCESS" = true ]; then
    echo
    echo 'inspecting access_token...'
    echo

    # Access Token
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    PATH_TO_INIT_ACCESS_TOKEN="$SCRIPT_DIR/../init_access_token.sh"
    source $PATH_TO_INIT_ACCESS_TOKEN

    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

    ACCESS_CURL_COMMAND="$CURL_COMMAND"

    if [ -z "$ACCESS_TOKEN" ]; then
        echo "ERROR: Please set ACCESS_TOKEN enviroment variable in env.sh"
        exit 1
    else
        ACCESS_CURL_COMMAND="$ACCESS_CURL_COMMAND --data 'token=$ACCESS_TOKEN'"
    fi

    if [ "$VERBOSE" = true ]; then
        echo "cURL command begin..."
        echo
        echo $ACCESS_CURL_COMMAND
        echo
        echo "...cURL commmand end"
        echo
    fi


    # Execute cURL command

    if [ "$OUTPUT_JSON" = true ]; then
        eval $ACCESS_CURL_COMMAND > $SCRIPT_DIR/output_access.json
    else
        eval $ACCESS_CURL_COMMAND
    fi 

    echo
    echo '...complete'
    echo
fi