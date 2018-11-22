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

# install global dependencies
COPY package.json yarn.lock ./
RUN yarn install

# install packages dependencies
COPY packages/base/package.json ./packages/base/
COPY packages/ens/package.json ./packages/ens/
COPY packages/erc20/package.json ./packages/erc20/
COPY packages/ethql/package.json ./packages/ethql/
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
COPY --from=builder /ethql/packages/ens/package.json ./packages/ens/
COPY --from=builder /ethql/packages/erc20/package.json ./packages/erc20/
COPY --from=builder /ethql/packages/ethql/package.json ./packages/ethql/

# copy built packages
COPY --from=builder /ethql/packages/base/dist ./packages/base/dist

COPY --from=builder /ethql/packages/ens/dist ./packages/ens/dist

COPY --from=builder /ethql/packages/erc20/dist ./packages/erc20/dist
COPY --from=builder /ethql/packages/erc20/abi ./packages/erc20/abi

COPY --from=builder /ethql/packages/ethql/dist ./packages/ethql/dist

ENTRYPOINT [ "node", "/ethql/packages/ethql/dist/index.js" ]
EXPOSE 4000
STOPSIGNAL 9
