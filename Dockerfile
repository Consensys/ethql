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
COPY package.json yarn.lock ./
RUN yarn install

# install packages dependencies
COPY packages/base/package.json ./packages/base/
COPY packages/ens/package.json ./packages/ens/
COPY packages/erc20/package.json ./packages/erc20/
COPY packages/server/package.json ./packages/server/
COPY packages/core/package.json ./packages/core/
COPY packages/web3-typings/package.json ./packages/web3-typings/
COPY lerna.json ./
RUN yarn bootstrap

# build all packages
COPY . ./
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

# copy package.json files (rarely changed)
COPY --from=builder /ethql/packages/base/package.json ./packages/base/
COPY --from=builder /ethql/packages/core/package.json ./packages/ethql/
COPY --from=builder /ethql/packages/ens/package.json ./packages/ens/
COPY --from=builder /ethql/packages/erc20/package.json ./packages/erc20/
COPY --from=builder /ethql/packages/server/package.json ./packages/server/

# copy built packages
COPY --from=builder /ethql/packages/base/dist ./packages/base/dist
COPY --from=builder /ethql/packages/core/dist ./packages/core/dist
COPY --from=builder /ethql/packages/ens/dist ./packages/ens/dist
COPY --from=builder /ethql/packages/erc20/dist ./packages/erc20/dist
COPY --from=builder /ethql/packages/erc20/abi ./packages/erc20/abi
COPY --from=builder /ethql/packages/server/dist ./packages/server/dist
COPY --from=builder /ethql/packages/server/dist ./packages/server/dist

ENTRYPOINT [ "node", "/ethql/packages/server/dist/index.js" ]
EXPOSE 4000
STOPSIGNAL 9
