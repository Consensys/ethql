FROM node:10 as builder

ENV ETHQL_INSTALL /ethql

RUN mkdir -p ${ETHQL_INSTALL}
WORKDIR ${ETHQL_INSTALL}

# Install dependencies. This step is performed separately to leverage Docker layer caching.
COPY package.json yarn.lock ${ETHQL_INSTALL}/
# Uncomment if patch-package is needed again.
# ADD patches ${ETHQL_INSTALL}/patches
RUN yarn install --production
RUN cp -r node_modules node_modules_production

RUN yarn install

COPY . ${ETHQL_INSTALL}

RUN yarn build:ts



FROM node:10-alpine

ENV ETHQL_INSTALL /ethql

RUN mkdir -p ${ETHQL_INSTALL}
WORKDIR ${ETHQL_INSTALL}

COPY --from=builder ${ETHQL_INSTALL}/node_modules_production ${ETHQL_INSTALL}/node_modules
COPY --from=builder ${ETHQL_INSTALL}/dist ${ETHQL_INSTALL}/dist

ENTRYPOINT [ "node", "/ethql/dist/index.js" ]
EXPOSE 4000
STOPSIGNAL 9
