ENS names can be used in queries in place of an address:

### Address:
```
  {
    account(address: "ethereum.eth") {
      code
      transactionCount
    }
  }
```

### TransactionRoles:

```
  {
    block(hash:"0x27cb5d9151939faeb4d5604b4ddb69fefcd166e690a9c1c9a235c024f376e49f") {
      transactionsRoles(to: "ethereum.eth") {
        hash
      }
    }
  }
```

### TransactionsInvolving

```
  {
    block(hash: "0x27cb5d9151939faeb4d5604b4ddb69fefcd166e690a9c1c9a235c024f376e49f") {
      transactionsInvolving(participants: ["ethereum.eth"]) {
        hash
      }
    }
  }
```
