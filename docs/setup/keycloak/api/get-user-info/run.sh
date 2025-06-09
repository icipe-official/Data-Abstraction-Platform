#!/bin/bash

# Setup Environment variables

# Global
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PATH_TO_INIT_ENV="$SCRIPT_DIR/../init_env.sh"
source $PATH_TO_INIT_ENV

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

OPTIONS=$(getopt -o '' -l "verbose,output-json" -n "script_name" -- "$@")

if [[ $? -ne 0 ]]; then
  echo "Error in command line arguments." >&2
  exit 1
fi

VERBOSE=false
OUTPUT_JSON=false
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
        --)
            shift
            break
            ;;
        *)
            break
            ;;
    esac
done

if [ -z "$HTTP_PATH" ]; then
    HTTP_PATH="/protocol/openid-connect/userinfo"
fi

CURL_COMMAND="$CURL_COMMAND -X GET --url $OPEN_ID_ISSUER_URL$HTTP_PATH -H 'authorization: Bearer $ACCESS_TOKEN'"

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
