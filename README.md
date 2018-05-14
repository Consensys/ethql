# A GraphQL interface to Ethereum 🔥

**This repo is currently in its Proof of Concept stages.**

ethql is a TypeScript application that exposes a GraphQL interface to the public Ethereum ledger. It works against the standard JSON-RPC APIs offered by all Ethereum clients. 

ethql reimagines blockchain data as a graph, and leverages the extensibility of GraphQL to introduce additional functionality, amongst which are:

* Decoding of standard transactions (e.g. ERC20, ENS, ERC223, etc.) out of the box.
* New query patterns enabled by indexing solutions (e.g. all transactions between any two accounts).
* Automatic batching and caching of requests.
* New filtering capabilities.
* Simple, inline unit conversions.
* Enhancing public data with informaton overlays imported from other sources.

This project is in the experimental phase, and all the cited features are under heavy development.

## Quickstart

You need a running Node environment with at least:
* nodejs >= 8.0.0
* [yarn](https://yarnpkg.com/)

Clone the repo and run:

```
$ yarn install
$ npm run dev
Running a GraphQL API server at http://localhost:4000/graphql
```

This ethql server uses [Infura](https://infura.io/) as a backend in anonymous mode. If you have an Infura ID (and if you don't, you should sign up for one!) you can set it like this:

```
$ INFURA_ID=myid npm run dev
```

## Development team

* Raúl Kripalani <raul.kripalani@consensys.net>
* Akhila Raju <akhila.raju@consensys.net>

