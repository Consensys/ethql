# ENS plugin

This plugin adds support for resolving addresses from the [Ethereum Name Service](https://ens.domains/).

ENS names can be used in queries in place of an address. Here are a few examples.

### Address

```
  {
    account(address: "ethereum.eth") {
      code
      transactionCount
    }
  }
```

### Transaction roles

```
  {
    block(hash:"0x27cb5d9151939faeb4d5604b4ddb69fefcd166e690a9c1c9a235c024f376e49f") {
      transactionsRoles(to: "ethereum.eth") {
        hash
      }
    }
  }
```

### Transactions involving

```
  {
    block(hash: "0x27cb5d9151939faeb4d5604b4ddb69fefcd166e690a9c1c9a235c024f376e49f") {
      transactionsInvolving(participants: ["ethereum.eth"]) {
        hash
      }
    }
  }
```
