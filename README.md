# A GraphQL interface for Ethereum 🔥

**This repo is currently in its Proof of Concept stages.**

ethql is a server that exposes a GraphQL endpoint to the public Ethereum ledger. It works against the standard JSON-RPC
APIs offered by all Ethereum clients. It is built in TypeScript, and thus leverages the vast ecosystem of GraphQL
tooling while preserving compile-time type safety.

ethql regards blockchain data as a graph, and leverages the extensibility of GraphQL to introduce additional
functionality, amongst which are:

- Decoding of standard transactions (e.g. ERC20, ENS, ERC223, etc.) out of the box.
- New query patterns enabled by indexing solutions (e.g. all transactions between any two accounts).
- Automatic batching and caching of requests.
- New filtering capabilities.
- Simple, inline unit conversions.
- Enhancing public data with information overlays imported from other sources.

This project is in the experimental phase, and all the cited features are under heavy development.

## Quickstart

You need a running Node environment with at least:

- nodejs >= 8.0.0
- [yarn](https://yarnpkg.com/)

Clone the repo and run:

```
$ yarn install
$ npm run dev
Running a GraphQL API server at http://localhost:4000/graphql
```

This ethql server uses [Infura](https://infura.io/) as a backend in anonymous mode. If you have an Infura ID (and if you
don't, you should sign up for one!) you can set it like this:

```
$ INFURA_ID=myid npm run dev
```

## Development team

- Raúl Kripalani <mailto:raul.kripalani@consensys.net>
- Akhila Raju <mailto:akhila.raju@consensys.net>

# Who we are

<a href="https://pegasys.tech/?utm_source=github&utm_medium=source&utm_campaign=ethql" rel="nofollow"><img src="https://raw.github.com/ConsenSys/ethql/master/logo.svg?sanitize=true" alt="PegaSys logo" data-canonical-src="https://raw.github.com/ConsenSys/ethql/master/logo.svg?sanitize=true" width="400"></a>

PegaSys’ mission is to build blockchain solutions ready for production in business environments. We are committed to
open source, and are creating a framework for collaborative innovation for the public-chain community and leading
enterprises.

Our team is composed of engineers leading in the areas of big data processing, applied cryptography, open source
computing, cloud services, and blockchain development.

[Learn more about PegaSys.](https://pegasys.tech/?utm_source=github&utm_medium=source&utm_campaign=ethql)
