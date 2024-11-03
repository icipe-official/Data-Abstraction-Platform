#!/bin/bash

# Set project base directory
SOURCE=${BASH_SOURCE[0]}
while [ -L "$SOURCE" ]; do # resolve $SOURCE until the file is no longer a symlink
    DIR=$( cd -P "$( dirname "$SOURCE" )" >/dev/null 2>&1 && pwd )
    SOURCE=$(readlink "$SOURCE")
    [[ $SOURCE != /* ]] && SOURCE=$DIR/$SOURCE # if $SOURCE was a relative symlink, we need to resolve it relative to the path where the symlink file was located
done
WORKING_DIR=$( cd -P "$( dirname "$SOURCE" )" >/dev/null 2>&1 && cd .. && pwd )

echo "Building web_service..."
    bash $WORKING_DIR/scripts/build_web_service_container_image.sh
echo "...building complete"
