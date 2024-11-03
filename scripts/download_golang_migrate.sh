#!/bin/bash

set -e # terminate script if commands fail

# NB. 
# 1. Create env.sh script in this current directory and copy contents of this file into it. 
# 2. Populate env variables with appropriate values 
# 3. Run `source env.sh` to set the env variables in the current shell session.
# Run this command from within the configs directory to ensure WORKING_DIR is set correctly.
# Reference: https://stackoverflow.com/questions/59895/how-do-i-get-the-directory-where-a-bash-script-is-located-from-within-the-script

# Set project root directory
SOURCE=${BASH_SOURCE[0]}
while [ -L "$SOURCE" ]; do # resolve $SOURCE until the file is no longer a symlink
    DIR=$( cd -P "$( dirname "$SOURCE" )" >/dev/null 2>&1 && pwd )
    SOURCE=$(readlink "$SOURCE")
    [[ $SOURCE != /* ]] && SOURCE=$DIR/$SOURCE # if $SOURCE was a relative symlink, we need to resolve it relative to the path where the symlink file was located
done
WORKING_DIR=$( cd -P "$( dirname "$SOURCE" )" >/dev/null 2>&1 && cd .. && pwd )

mkdir -p $WORKING_DIR/bin

# Replace with relevant values
VERSION="v4.18.1"
OS="linux"
ARCH="amd64"
COMPRESS_TYPE="tar.gz"

# Download golang migrate and place the executable in the bin directory
curl -L https://github.com/golang-migrate/migrate/releases/download/$VERSION/migrate.$OS-$ARCH.$COMPRESS_TYPE | tar xvz -C $WORKING_DIR/bin/