#!/bin/bash

# Exit script with error if it is occured
set -e

docker_image_name="code-runner-node"

# Check if container exist
if [ ! "$(docker ps -q -f name=${docker_image_name})" ]; then
    if [ "$(docker ps -aq -f status=exited -f name=${docker_image_name})" ]; then
        echo "Removing container because current one is stopped:"
        docker rm "${docker_image_name}"
    else
      echo "Container doesn't exist."
    fi

    echo "Creating new container:"
    docker run -it -d --name=code-runner-node --entrypoint /bin/bash codewars/node-runner
    echo "Container created."
else
  echo "Nothing to do. Container already runned."
fi
