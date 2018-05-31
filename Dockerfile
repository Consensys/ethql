FROM node:10-alpine

ENV ETHQL_INSTALL /ethql
RUN \
  mkdir ${ETHQL_INSTALL} && \
  apk update && apk upgrade && \
  apk add --no-cache bash git openssh python build-base

WORKDIR ${ETHQL_INSTALL}

# Install dependencies. This step is performed separately to leverage Docker layer caching.
COPY package.json yarn.lock /ethql/
RUN yarn

ADD . /ethql
RUN \
  yarn build && \
  yarn cache clean && \
  yarn install --production --ignore-scripts --prefer-offline

ENTRYPOINT [ "node", "/ethql/dist/index.js" ]
EXPOSE 4000
STOPSIGNAL 9