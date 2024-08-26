FROM node:lts-slim

RUN apt-get update && apt-get install tini --no-install-recommends -y && apt-get clean && rm -rf /var/lib/apt-get/lists/*

ARG enable_mecab=1

RUN if [ $enable_mecab -ne 0 ]; then apt-get update \
  && apt-get install mecab mecab-ipadic-utf8 --no-install-recommends -y \
  && apt-get clean \
  && rm -rf /var/lib/apt-get/lists/*; fi

COPY . /ai

WORKDIR /ai
RUN corepack enable && npm install && npm run build || test -f ./built/index.js

ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["npm", "start"]
