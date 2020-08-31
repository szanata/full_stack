#!/bin/bash

set -e

printf "\n\e[34;1m[Testing node 14]\e[0m\n"

docker run --rm -it \
  -e NODE_ENV=development \
  -v `pwd`:/app/ \
  -w /app/ \
    node:14.9.0-alpine /bin/sh -c "npm install && npm run lint && npm run test"

printf "\n\e[34;1m[Testing node 12]\e[0m\n"
docker run --rm -it \
  -e NODE_ENV=development \
  -v `pwd`:/app/ \
  -w /app/ \
    node:12.18.3-alpine /bin/sh -c "npm run test:traps"

printf "\n\e[34;1m[Testing node 10]\e[0m\n"
docker run --rm -it \
  -e NODE_ENV=development \
  -v `pwd`:/app/ \
  -w /app/ \
    node:10.22.0-alpine /bin/sh -c "npm run test:traps"

printf "\n\e[34;1m[Testing node 8]\e[0m\n"
docker run --rm -it \
  -e NODE_ENV=development \
  -v `pwd`:/app/ \
  -w /app/ \
    node:8.17.0-alpine /bin/sh -c "npm run test:traps"

printf "\n\e[92;1m[Tests done]\e[0m\n"
