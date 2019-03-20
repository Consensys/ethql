# A GraphQL interface to Ethereum 🔥 

[![CircleCI](https://circleci.com/gh/ConsenSys/ethql.svg?style=svg)](https://circleci.com/gh/ConsenSys/ethql)
[![Gitter](https://img.shields.io/gitter/room/ethql/lobby.js.svg?style=flat-square)](https://gitter.im/ethql/Lobby)

**▶️ Try out the Alpha on Infura:
[https://ethql-alpha.infura.io/graphql](<https://ethql-alpha.infura.io/graphql?query=%7B%0A%20%20block(number%3A%205000000)%20%7B%0A%20%20%20%20hash%0A%20%20%20%20transactions(filter%3A%20%7B%20withInput%3A%20true%20%7D)%20%7B%0A%20%20%20%20%20%20index%0A%20%20%20%20%20%20hash%0A%20%20%20%20%20%20from%20%7B%0A%20%20%20%20%20%20%20%20address%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20to%20%7B%0A%20%20%20%20%20%20%20%20address%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20decoded%20%7B%0A%20%20%20%20%20%20%20%20entity%0A%20%20%20%20%20%20%20%20operation%0A%20%20%20%20%20%20%20%20standard%0A%20%20%20%20%20%20%20%20...%20on%20ERC20Transfer%20%7B%0A%20%20%20%20%20%20%20%20%20%20tokenContract%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20symbol%0A%20%20%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%20%20from%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20account%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20address%0A%20%20%20%20%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%20%20%20%20tokenBalance%0A%20%20%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%20%20to%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20account%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20address%0A%20%20%20%20%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%20%20value%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20%7D%0A%7D%0A%0A%0A>)**

[Example queries.](#query-handbook)

EthQL is a server that exposes a GraphQL endpoint to the public Ethereum ledger. It works against the standard JSON-RPC
APIs offered by all Ethereum clients. It is built in TypeScript, and thus leverages the vast ecosystem of GraphQL
tooling while preserving compile-time type safety.

EthQL regards blockchain data as a graph, and leverages the extensibility of GraphQL to introduce additional
functionality, amongst which are:

- Decoding of standard transactions (e.g. ERC20, ENS, ERC223, etc.) out of the box.
- New query patterns enabled by indexing solutions (e.g. all transactions between any two accounts).
- Automatic batching and caching of requests.
- New filtering capabilities.
- Simple, inline unit conversions.
- Enhancing public data with information overlays imported from other sources.

_NOTE: This project is under heavy development._

## Quickstart

You need a running Node environment with at least:

- nodejs >= 8.0.0
- [yarn](https://yarnpkg.com/)

Clone the repo and run:

```
$ yarn install
$ yarn bootstrap
$ yarn run dev
JSON-RPC (web3): Using HTTP(S) provider with endpoint: https://mainnet.infura.io/
Running a GraphQL API server at http://0.0.0.0:4000/graphql (browse here: http://localhost:4000/graphql)
```

This EthQL server uses [Infura](https://infura.io/) as a backend in anonymous mode. If you have an Infura project ID (and if you don't, you should sign up for one!) you can set it like this:

```
$ INFURA_ID=myid yarn run dev
```
## Development
The `debug` module is included in Dev Dependencies

To turn on debugging:
```
DEBUG=ethql:*
```

## Query Handbook

We suggest fiddling with some [Example Use Cases](https://github.com/ConsenSys/ethql/wiki/Example-Use-Cases) to see some
queries in action.

For an in-depth guide on how to use EthQL, please start with the document
[Top-Level Queries](https://github.com/ConsenSys/ethql/wiki/Top-Level-Queries). This document shows all of the root
fields available to query, including information on specific block(s), transaction(s), and account(s).

The following sections provide a deep dive into all of the fields available on top-level queries:

- [Block Query Fields](https://github.com/ConsenSys/ethql/wiki/Block-Query-Fields)
- [Account Query Fields](https://github.com/ConsenSys/ethql/wiki/Account-Query-Fields)
- [Transaction Query Fields](https://github.com/ConsenSys/ethql/wiki/Transaction-Query-Fields)
- [Log Query Fields](https://github.com/ConsenSys/ethql/wiki/Log-Query-Fields)
- [Decoded Transaction Query Fields](https://github.com/ConsenSys/ethql/wiki/Decoded-Transaction-Query-Fields)

## Contributing

If you are interested in fixing issues and contributing directly to the code base, please see the document
[How to Contribute](https://github.com/ConsenSys/ethql/wiki/How-to-Contribute), which covers the following:

- [Submitting Bugs and Suggestions](https://github.com/ConsenSys/ethql/wiki/Submitting-Bugs-and-Suggestions)
- [Feedback Channels](https://github.com/ConsenSys/ethql/wiki/Feedback-Channels)
- [Coding Guidelines](https://github.com/ConsenSys/ethql/wiki/Coding-Guidelines)
- [Contributor License Agreement](https://github.com/ConsenSys/ethql/wiki/Contributor-License-Agreement)

Please see also our [Code of Conduct](https://github.com/ConsenSys/ethql/wiki/Contributor-Code-of-Conduct).

## Feedback

- Request a new feature on [GitHub](https://github.com/ConsenSys/ethql/wiki/Submitting-Bugs-and-Suggestions).
- Vote for
  [popular feature requests](https://github.com/ConsenSys/ethql/issues?q=is%3Aopen+is%3Aissue+label%3A%22Type%3A+Feature%22).
- File a bug in [GitHub Issues](https://github.com/ConsenSys/ethql/issues).
- [Tweet](https://twitter.com/PegasysEng) us with other feedback

## Development team

- Raúl Kripalani [(contact)](mailto:raul.kripalani@consensys.net)
- Akhila Raju [(contact)](mailto:akhila.raju@consensys.net)

# Who we are

<a href="https://pegasys.tech/?utm_source=github&utm_medium=source&utm_campaign=ethql" rel="nofollow"><img src="https://raw.github.com/ConsenSys/ethql/master/logo.svg?sanitize=true" alt="PegaSys logo" data-canonical-src="https://raw.github.com/ConsenSys/ethql/master/logo.svg?sanitize=true" width="400"></a>

PegaSys’ mission is to build blockchain solutions ready for production in business environments. We are committed to
open source, and are creating a framework for collaborative innovation for the public-chain community and leading
enterprises.

Our team is composed of engineers leading in the areas of big data processing, applied cryptography, open source
computing, cloud services, and blockchain development.

[Learn more about PegaSys.](https://pegasys.tech/?utm_source=github&utm_medium=source&utm_campaign=ethql)
