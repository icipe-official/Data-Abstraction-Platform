#!/bin/bash

# Set project base directory
SOURCE=${BASH_SOURCE[0]}
while [ -L "$SOURCE" ]; do # resolve $SOURCE until the file is no longer a symlink
    DIR=$( cd -P "$( dirname "$SOURCE" )" >/dev/null 2>&1 && pwd )
    SOURCE=$(readlink "$SOURCE")
    [[ $SOURCE != /* ]] && SOURCE=$DIR/$SOURCE # if $SOURCE was a relative symlink, we need to resolve it relative to the path where the symlink file was located
done
WORKING_DIR=$( cd -P "$( dirname "$SOURCE" )" >/dev/null 2>&1 && cd .. && pwd )

while getopts t:c: flag
do
    case "${flag}" in
        t) CONTAINER_TAG=${OPTARG};;
        c) CONTAINER_CLI=${OPTARG};;
    esac
done
if [ -n "$CONTAINER_TAG" ]; then
    CONTAINER_TAG="latest"
fi
if [ -n "$CONTAINER_CLI" ]; then
    CONTAINER_CLI="docker"
fi

echo "Building container images..."
bash $WORKING_DIR/scripts/build_keycloak_container_image.sh -t $CONTAINER_TAG -c $CONTAINER_CLI
bash $WORKING_DIR/scripts/build_web_service_container_image.sh -t $CONTAINER_TAG -c $CONTAINER_CLI
echo "...building complete"
