FROM node:10-alpine

ENV ETHQL_INSTALL /ethql
RUN \
  mkdir ${ETHQL_INSTALL} && \
  apk update && apk upgrade && \
  apk add --no-cache bash && \
  apk add --no-cache --virtual .build-deps git openssh python build-base

WORKDIR ${ETHQL_INSTALL}

# Install dependencies. This step is performed separately to leverage Docker layer caching.
COPY package.json yarn.lock ${ETHQL_INSTALL}/
ADD patches ${ETHQL_INSTALL}/patches
RUN \
  yarn install --production && \
  apk del .build-deps && \
  rm -rf /var/cache/apk/*

ADD dist ${ETHQL_INSTALL}
ENTRYPOINT [ "node", "/ethql/index.js" ]
EXPOSE 4000
STOPSIGNAL 9