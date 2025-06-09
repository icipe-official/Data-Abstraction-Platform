#!/bin/bash

# Setup Environment variables

# Global
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PATH_TO_INIT_ENV="$SCRIPT_DIR/../init_env.sh"
source $PATH_TO_INIT_ENV

# Local
PATH_TO_ENV="$SCRIPT_DIR/env.sh"

if [ -f "$PATH_TO_ENV" ]; then
    source $PATH_TO_ENV
fi



# Build cURL command

CURL_COMMAND="curl"

OPTIONS=$(getopt -o '' -l "verbose,revoke-refresh,revoke-access" -n "script_name" -- "$@")

if [[ $? -ne 0 ]]; then
  echo "Error in command line arguments." >&2
  exit 1
fi

VERBOSE=false
OUTPUT_JSON=false
REVOKE_ACCESS=false
REVOKE_REFRESH=false
while true; do
    case "$1" in
        --verbose)
            CURL_COMMAND="$CURL_COMMAND -v"
            VERBOSE=true
            shift
            ;;
        --revoke-refresh)
            REVOKE_ACCESS=true
            shift
            ;;
        --revoke-access)
            REVOKE_REFRESH=true
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

if [ "$REVOKE_ACCESS" = false ] && [ "$REVOKE_REFRESH" = false ]; then
    REVOKE_ACCESS=true
    REVOKE_REFRESH=true
fi

if [ -z "$HTTP_PATH" ]; then
    HTTP_PATH="/protocol/openid-connect/revoke"
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

CURL_COMMAND="$CURL_COMMAND -X POST -u '$CLIENT_ID:$CLIENT_SECRET' -H 'Content-Type: application/x-www-form-urlencoded' -H 'Accept: application/json' --url $OPEN_ID_ISSUER_URL$HTTP_PATH"

if [ "$REVOKE_REFRESH" = true ]; then
    echo
    echo 'revoking refresh_token...'
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

    REFRESH_CURL_COMMAND="$REFRESH_CURL_COMMAND --data 'token_type_hint=refresh_token'"

    if [ "$VERBOSE" = true ]; then
        echo "cURL command begin..."
        echo
        echo $REFRESH_CURL_COMMAND
        echo
        echo "...cURL commmand end"
        echo
    fi


    # Execute cURL command

    eval $REFRESH_CURL_COMMAND

    echo
    echo '...complete'
    echo
fi

if [ "$REVOKE_ACCESS" = true ]; then
    echo
    echo 'revoking access_token...'
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

    ACCESS_CURL_COMMAND="$ACCESS_CURL_COMMAND --data 'token_type_hint=access_token'"

    if [ "$VERBOSE" = true ]; then
        echo "cURL command begin..."
        echo
        echo $ACCESS_CURL_COMMAND
        echo
        echo "...cURL commmand end"
        echo
    fi


    # Execute cURL command

    eval $ACCESS_CURL_COMMAND

    echo
    echo '...complete'
    echo
fi