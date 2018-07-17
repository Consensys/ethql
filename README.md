# A GraphQL interface to Ethereum 🔥

[![Gitter](https://img.shields.io/gitter/room/ethql/lobby.js.svg?style=for-the-badge)](https://gitter.im/ethql/Lobby)

**▶️ Try it out: http://ethql-lb-979715030.eu-west-3.elb.amazonaws.com/graphql.**

[Example queries](#example-queries).

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
$ npm run dev
JSON-RPC (web3): Using HTTP(S) provider with endpoint: https://mainnet.infura.io/
Running a GraphQL API server at http://0.0.0.0:4000/graphql (browse here: http://localhost:4000/graphql)
```

This EthQL server uses [Infura](https://infura.io/) as a backend in anonymous mode. If you have an Infura ID (and if you
don't, you should sign up for one!) you can set it like this:

```
$ INFURA_ID=myid npm run dev
```

## Example queries

_Fetch all transactions from block 5000000 that have input data, and for those that can be decoded as token transfers,
return the token symbol, sending and receiving addresses, as well as the token balance of the sending address._

```
{
  block(number: 5000000) {
    hash
    transactions(filter: { withInput: true }) {
      index
      hash
      from {
        address
      }
      to {
        address
      }
      decoded {
        ... on ERC20Transfer {
          tokenContract {
            symbol
          }
          from {
            account {
            	address
            }
            tokenBalance
          }
          to {
            account {
              address
            }
          }
          value
        }
      }
    }
  }
}
```

_For all blocks between 5400000 and 5400005 inclusive (6 blocks), get the balance of all addresses that sent a
transaction._

```
{
  blocksRange(numberRange: [5400000, 5400005]) {
    transactions {
      hash
      value
      from {
        address
        balance
      }
      to {
        address
      }
    }
  }
}
```

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
