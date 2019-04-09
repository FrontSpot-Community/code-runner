#!/bin/bash

# Exit script with error if it is occured
set -e

# Associative array with Docker container_name: image_name values
declare -A docker_image_names=(
    # Container name: Docker image name from Code Wars registry
    # see https://github.com/Codewars/codewars-runner-cli for existing images names.
    ["code-runner-node"]="frontspot/node-runner"
    ["code-runner-php"]="codewars/alt-runner"
    ["code-runner-csharp"]="codewars/dotnet-runner"
    ["code-runner-java"]="codewars/java-runner"
    ["code-runner-python"]="codewars/python-runner"
)

for docker_container_name in "${!docker_image_names[@]}"; do
    docker_image_name=${docker_image_names[$docker_container_name]}

    # Check if container exist
    if [ ! "$(docker ps -q -f name=${docker_container_name})" ]; then
        if [ "$(docker ps -aq -f status=exited -f name=${docker_container_name})" ]; then
            echo "Removing ${docker_container_name} container because current one is stopped:"
            docker rm "${docker_container_name}"
        else
          echo "Container doesn't exist."
        fi

        echo "Creating new ${docker_container_name} container:"
        docker run -it -d --name="$docker_container_name" --entrypoint /bin/bash ${docker_image_name}
        echo "Container created."
    else
      echo "Nothing to do. Container already runned."
    fi
done
