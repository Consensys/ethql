##########################################################################
#
# Builder image: 
# Runs module install and compiles TypeScript.
#
##########################################################################

FROM node:10 as builder

RUN mkdir -p /ethql
WORKDIR /ethql

# Uncomment if patch-package is needed again.
# ADD patches /ethql/patches

# Install dependencies. This step is performed separately to leverage Docker layer caching.
COPY package.json yarn.lock /ethql/
RUN yarn install --production && \
  cp -R node_modules node_modules_production && \
  yarn install

COPY . /ethql

RUN yarn build:ts

##########################################################################
#
# Production image: 
# Contains only production dependencies and compiled JS.
#
##########################################################################

FROM node:10-alpine

RUN mkdir -p /ethql
WORKDIR /ethql

COPY --from=builder /ethql/node_modules_production /ethql/node_modules
COPY --from=builder /ethql/dist /ethql/dist

ENTRYPOINT [ "node", "/ethql/dist/index.js" ]
EXPOSE 4000
STOPSIGNAL 9
