# Docker

Section talks about setting up and installing the docker engine on a computer with a debian-based OS.

Instructions as well as other methods of installation can be found [here](https://docs.docker.com/engine/install/).

Last Updated: `16/04/2024`.

## Installation

Instructions below require `root` privileges.

Run `sudo su` or `su -` beforehand.

```sh
#!/bin/bash

# Add Docker's official GPG key:
apt-get update
apt-get install ca-certificates curl
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
chmod a+r /etc/apt/keyrings/docker.asc

# Add the repository to Apt sources:
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  tee /etc/apt/sources.list.d/docker.list > /dev/null
apt-get update


apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```
