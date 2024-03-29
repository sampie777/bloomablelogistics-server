#!/bin/bash
NAME="sajansen/bloomablelogistics-server"

VERSION=$(sed 's/.*"version": "\(.*\)".*/\1/;t;d' ./package.json)
progname=$(basename $0)

function usage {
  cat << HEREDOC

     Usage: $progname <command>

     commands:
       run                  Run docker-compose
       build                Build a docker image
       push                 Push current docker image
       version              Print project version

     optional arguments:
       -h, --help           Show this help message and exit

HEREDOC
}

function run {
  echo "\`run\` Not implemented"
#  docker-compose -f docker/docker-compose.yaml up
}

function build {
  echo Building docker image ${NAME}:${VERSION}
  docker build -t ${NAME} -f docker/Dockerfile . || exit 1
  docker tag ${NAME} ${NAME}:${VERSION} || exit 1
}

function push {
  echo Pushing docker image ${NAME}:${VERSION}
  docker push ${NAME}:${VERSION}
  docker push ${NAME}
}

command="$1"
case $command in
  run)
    run
    ;;
  build)
    build
    ;;
  push)
    push
    ;;
  version)
    echo "$VERSION"
    ;;
  -h|--help)
    usage
    ;;
  *)
    echo "Invalid command"
    exit 1
    ;;
esac
