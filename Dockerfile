##########################################################################
#
# Builder image: 
# Runs module install and compiles TypeScript.
#
##########################################################################

FROM node:10 as builder

RUN mkdir -p /ethql
WORKDIR /ethql

# install global dependencies
COPY package.json yarn.lock  ./
RUN yarn install

# COPY codebase 
COPY . ./

# Install Lerna config
COPY lerna.json ./
RUN yarn bootstrap

# build all packages
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

# copy dependencies (global AND package)
COPY --from=builder /ethql/node_modules ./node_modules
COPY --from=builder /ethql/package.json ./package.json
COPY --from=builder /ethql/lerna.json ./lerna.json

# copy package.json files (rarely changed)
COPY --from=builder /ethql/packages/base/package.json ./packages/base/
COPY --from=builder /ethql/packages/plugin/package.json ./packages/plugin/
COPY --from=builder /ethql/packages/core/package.json ./packages/core/
COPY --from=builder /ethql/packages/ens/package.json ./packages/ens/
COPY --from=builder /ethql/packages/erc20/package.json ./packages/erc20/
COPY --from=builder /ethql/packages/server/package.json ./packages/server/

# copy built packages
COPY --from=builder /ethql/packages/base/dist ./packages/base/dist
COPY --from=builder /ethql/packages/plugin/dist ./packages/plugin/dist
COPY --from=builder /ethql/packages/core/dist ./packages/core/dist
COPY --from=builder /ethql/packages/ens/dist ./packages/ens/dist
COPY --from=builder /ethql/packages/erc20/dist ./packages/erc20/dist
COPY --from=builder /ethql/packages/erc20/abi ./packages/erc20/abi
COPY --from=builder /ethql/packages/server/dist ./packages/server/dist
COPY packages/server/bin /ethql/packages/server/bin

RUN npx lerna link
ENTRYPOINT [ "node", "/ethql/packages/server/bin/ethql.js" ]
EXPOSE 4000
STOPSIGNAL 9
