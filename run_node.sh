#!/bin/bash

docker run --rm -it \
  -e NPM_TOKEN=${NPM_TOKEN} \
  -e NODE_ENV=development \
  -v `pwd`:/app/ \
  -w /app/ \
    node:14.9.0-alpine /bin/sh
