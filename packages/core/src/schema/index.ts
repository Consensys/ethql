export default `
extend type Query {
  "Selects an account."
  account(address: Address!, blockNumber: Long): Account!

  "Selects a block based on either a number, hash or a tag."
  block(number: Long, hash: Bytes32, tag: BlockTag): Block

  """Return all blocks between tow numbers, inclusive. If to
  is not supplied, it defaults to the most recent known block
  """
  blocks(from: Long!, to: Long): [Block!]!

  "Selects an arbitrary set of blocks based on their numbers or hashes."
  blockList(numbers: [Long], hashes: [Bytes32]): [Block]

  "Selects a block based on a reference block and an offset from it."
  blockOffset(number: Long, hash: Bytes32, tag: BlockTag, offset: Int!): Block

  "Selects a range of blocks."
  blocksRange(numberRange: [Long], hashRange: [Bytes32]): [Block]

  "Selects a transaction by hash."
  transaction(hash: Bytes32): Transaction

  """EstimateGas estimates the amount of gas that will be required for
  successful execution of a transaction. If blockNumber is not specified,
  it defaults ot the most recent known block."""
  estimateGas(data: CallData!, blockNumber: Long): Long!

  """ Logs return log entries matching the provided filter"""
  logs(filter: LogFilter!): [Log]!

  """
  GasPrice returns the node's estimate of a gas price sufficient to
  ensure a transaction is mined in a timely fashion.
  """
  gasPrice: BigInt!

  """Return the current wire protocol version number."""
  protocolVersion: Int!

  "Returns the health of the server."
  health: String!
}

"""
An Ethereum Block.
"""
type Block {
  "The block number."
  number: Long!

  "The block hash."
  hash: Bytes32!

  "The parent block."
  parent: Block

  "The block nonce."
  nonce: Bytes!

  "The block's transactions trie root."
  transactionsRoot: Bytes32!

  "The number of transactions in the block."
  transactionCount: Int

  "The block's state trie root."
  stateRoot: Bytes32!

  "The receipt trie root."
  receiptsRoot: Bytes32!

  "The miner's account."
  miner(block: Long): Account!

  "Any extra data attached to the block."
  extraData: Bytes!

  "The cumulative gas limit of all transactions in this block."
  gasLimit: Long!

  "The cumulative gas used of all transactions in this block."
  gasUsed: Long!

  "The timestamp when block was mined, in seconds after epoch."
  timestamp: BigInt!

  """LogsBloom is a bloom filter that can be used to check if a block may
  contain log entries matching a filter."""
  logsBloom: Bytes!

  "The mix hash for this block."
  mixHash: Bytes32!

  "The difficulty of this block."
  difficulty: Long!

  "The total difficulty of the canonical chain this block is part of."
  totalDifficulty: Long!

  """OmmerCount is the number of ommers (AKA uncles) associated with this
  block. If ommers are unavailable, this field will be null."""
  ommerCount: Int

  """Ommers is a list of ommer (AKA uncle) blocks associated with this block.
  If ommers are unavailable, this field will be null. Depending on your
  node, the transactions, transactionAt, transactionCount, ommers,
  ommerCount and ommerAt fields may not be available on any ommer blocks."""
  ommers: [Block]

  """OmmerAt returns the ommer (AKA uncle) at the specified index. If ommers
  are unavailable, or the index is out of bounds, this field will be null."""
  ommerAt(index: Int!): Block

  """OmmerHash is the keccak256 hash of all the ommers (AKA uncles)
  associated with this block."""
  ommerHash: Bytes32

  "Gets a single transaction from this block, addressed by its position in the block."
  transactionAt(index: Int!): Transaction

  "Gets all transactions from this block. If a filter is passed, only the transactions matching the filter will be returned."
  transactions(filter: TransactionFilter): [Transaction!]

  """
  Gets all transactions from this block as long as they involve any of the addresses specified.
  If a filter is passed, only the transactions matching the filter will be returned.
  """
  transactionsInvolving(participants: [Address]!, filter: TransactionFilter): [Transaction]

  """
  Gets all transactions from this block where the provided addresses take the indicated roles.
  If a filter is passed, only the transactions matching the filter will be returned.
  """
  transactionsRoles(from: Address, to: Address, filter: TransactionFilter): [Transaction]

  """
  Logs returns a filtered set of logs from this block
  """
  logs(filter: LogFilter): [Log!]!

  """
  Call executes a local call operation. Calls referenced to the local block
  """
  call(data: CallData!): CallResult
}

"""
CallData represents the data associated with a local contract call.
All fields are optional.
"""
input CallData {
    # From is the address making the call.
    from: Address
    # To is the address the call is sent to.
    to: Address
    # Gas is the amount of gas sent with the call.
    gas: Long
    # GasPrice is the price, in wei, offered for each unit of gas.
    gasPrice: String
    # Value is the value, in wei, sent along with the call.
    value: BigInt
    # Data is the data sent to the callee.
    data: Bytes
}

"""
CallResult is the result of a local call operation.
"""
type CallResult {
    # Data is the return data of the called contract.
    data: Bytes!
    # GasUsed is the amount of gas used by the call, after any refunds.
    gasUsed: Long!
    # Status is the result of the call - 1 for success or 0 for failure.
    status: Long!
}

"""
Named block identifiers.
"""
enum BlockTag {
  EARLIEST
  LATEST
  PENDING
}

"""
Input object to select a block by offset.
"""
input BlockOffset {
  number: Long
  hash: Bytes32
  offset: Int
}

"""
The storage of this contract.

Provides fluent accessors for solidity contract storage. Four data types are supported:
Dynamic arrays, fixed arrays, maps with string keys, and maps with numeric keys.

The algorithm to calculate the storage key varies for each data type.
"""
type Storage {
  "Gets the value at this storage slot."
  value(at: Int!): String

  """
  Steps into a map at this storage slot.
  keyType can be address, number, or string.
  """
  solidityMap(at: Int!, keyType: KeyType!): SolidityMap

  "Steps into a fixed array at this storage slot."
  solidityFixedArray(at: Int!): SolidityFixedArray

  "Steps into a dynamic array at this storage slot."
  solidityDynamicArray(at: Int!): SolidityDynamicArray
}

"""
A solidity map.
"""
type SolidityMap {
  "Gets the value returned by this key."
  value(at: String!): String

  """
  Steps into the map returned by this key.
  keyType can be address, number, or string.
  """
  solidityMap(at: String!, keyType: KeyType!): SolidityMap

  "Steps into the fixed array returned by this key."
  solidityFixedArray(at: String!): SolidityFixedArray

  "Steps into the dynamic array returned by this key."
  solidityDynamicArray(at: String!): SolidityDynamicArray
}

"""
A fixed solidity array.
"""
type SolidityFixedArray {
  "Gets value at this index."
  value(at: Int!): String

  """
  Steps into the map at this index.
  keyType can be address, number, or string.
  """
  solidityMap(at: Int!, keyType: KeyType!): SolidityMap

  "Steps into the fixed array at this index."
  solidityFixedArray(at: Int!): SolidityFixedArray

  "Steps into the dynamic array at this index."
  solidityDynamicArray(at: Int!): SolidityDynamicArray
}

"""
A dynamic solidity array.
"""
type SolidityDynamicArray {
  "Gets value at this index."
  value(at: Int!): String

  """
  Steps into the map at this index.
  keyType can be address, string, or number.
  """
  solidityMap(at: Int!, keyType: KeyType!): SolidityMap

  "Steps into the fixed array at this index."
  solidityFixedArray(at: Int!): SolidityFixedArray

  "Steps into the dynamic array at this index."
  solidityDynamicArray(at: Int!): SolidityDynamicArray
}

"""
An Ethereum account.
"""
type Account {
  "The address of this account"
  address: Address

  "The balance of this account"
  balance(unit: Unit): BigInt!

  "The code behind this account"
  code: Bytes

  "The type of this account"
  type: AccountType

  "The number of transactions this account has sent"
  transactionCount: Long!

  "The storage of this account"
  storage: Storage
}

"""
A filter for logs.
"""
input LogFilter {
  """
  Only selects logs that are published under the given topics.

  Items within an inner list are combined with an AND, and items on the outer list are combined with OR.

  For example: { topics: [["0x1234...", "0xabcd..."], ["0xbcde..."]] } will return all logs published under
  topics "0x1234..." AND "0xabcd...", as well as those published under topic "0xbcde..."
  """
  topics: [[Bytes32]]
}

"""
An Ethereum transaction.
"""
type Transaction {
  "Transaction hash"
  hash: Bytes32!

  "Transaction nonce"
  nonce: Long!

  "The index of the transaction within the block"
  index: Int

  "Sender of this transaction"
  from(block: Long): Account!

  "Recipient of this transaction"
  to(block: Long): Account

  "Value in wei, sent along with this transaction"
  value: BigInt!

  "Value of the transaction converted into specified denomination"
  convertValue(unit: Unit): Float!

  "GasPrice is the price offered to miners for gas, in weigh per unit"
  gasPrice: BigInt!

  "Price set for each gas unit"
  convertGasPrice(unit: Unit): Float!

  "The maximum amount of gas this tranaction can consome"
  gas: Long!

  "GasUsed is the amount of gas that was used in processing this transaction"
  gasUsed: Long

  """cumulativeGasUsed is the total gas used in the block up to and including
  this transaction. If the transaction has not yet been mined, this field will be null"""
  cumulativeGasUsed: Long

  """CreatedContract is the account that was created by a contract creation
  transaction. If the transaction was not a contract creation transaction,
  or it has not yet been mined, this field will be null."""
  createdContract(block: Long): Account

  "The input data to the transaction"
  inputData: Bytes

  "The status of the transaction"
  status: TransactionStatus

  "The block the transaction is contained in"
  block: Block

  "The logs emitted by this transaction."
  logs(filter: LogFilter): [Log]

  """
  The decoded transaction.

  This is a best-effort interpretation of the transaction data.  There may be cases where a transaction cannot be unambiguously decoded.
  For example, because some standards share function signatures, a single transaction may appear to match several different standards.
  """
  decoded: DecodedTransaction
}

"""
An Ethereum log.
"""
type Log {
  "The index of this log in the block's logs array."
  index: Int!

  "The account that emitted this log."
  account: Account!

  "The topics under which this log was published."
  topics: [String]

  "The data within this log statement."
  data: String

  "The block this log was contained in."
  block: Block!

  "The transaction that emitted this log."
  transaction: Transaction!

  """
  The decoded log.

  This is a best-effort interpretation of the log data.  There may be cases where a log cannot be unambiguously decoded.
  For example, because some standards share event signatures, a single log may appear to match several different standards.
  """
  decoded: DecodedLog
}

"""
The status or outcome of the transaction.
"""
enum TransactionStatus {
  "Transaction failed"
  FAILED

  "Transaction was successful"
  SUCCESS

  "Transaction has not been mined yet"
  PENDING
}

enum KeyType {
  address
  number
  string
}

"""
A filter for transactions. Setting multiple criteria is equivalent to combining them with an AND operator.
"""
input TransactionFilter {
  "Only selects transactions that emit logs."
  withLogs: Boolean

  "Only selects transactions that received input data."
  withInput: Boolean

  "Only selects transactions that created a contract."
  contractCreation: Boolean
}

"""
Entities are a way to group related standards into one functional concept, e.g. ERC20, ERC777 refer to the 'token' entity,
the ENS standard refers to the 'domain' entity.
"""
enum Entity {
  token
}

interface DecodedTransaction {
  "The entity this transaction refers to. See documentation on the Entity type."
  entity: Entity

  "The ERC standard (or official name) this transaction appears to comply with."
  standard: String

  "The name of the function invoked in this transaction."
  operation: String
}

interface DecodedLog {
  "The entity this log refers to. See documentation on the Entity type."
  entity: Entity

  "The ERC standard (or official name) this log appears to comply with."
  standard: String

  "The name of the event associated with this log (i.e. first log topic)."
  event: String
}

"""
Type of account.
"""
enum AccountType {
  CONTRACT
  EXTERNALLY_OWNED
}

enum Unit {
  "base unit"
  wei
  "1 kwei == 1_000 wei"
  kwei
  "1 babbage == 1_000 wei"
  babbage
  "1 femtoether == 1_000 wei"
  femtoether
  "1 mwei == 1_000_000 wei"
  mwei
  "1 lovelace == 1_000_000 wei"
  lovelace
  "1 picoether == 1_000_000 wei"
  picoether
  "1 gwei == 1_000_000_000 wei"
  gwei
  "1 shannon == 1_000_000_000 wei"
  shannon
  "1 nanoether == 1_000_000_000 wei"
  nanoether
  "1 nano == 1_000_000_000 wei"
  nano
  "1 szabo == 1_000_000_000_000 wei"
  szabo
  "1 microether == 1_000_000_000_000 wei"
  microether
  "1 micro == 1_000_000_000_000 wei"
  micro
  "1 finney == 1_000_000_000_000_000 wei"
  finney
  "1 milliether == 1_000_000_000_000_000 wei"
  milliether
  "1 milli == 1_000_000_000_000_000 wei"
  milli
  "1 ether == 1_000_000_000_000_000_000 wei"
  ether
  "1 kether == 1_000_000_000_000_000_000_000 wei == 1_000 ether"
  kether
  "1 grand == 1_000_000_000_000_000_000_000 wei == 1_000 ether"
  grand
  "1 mether == 1_000_000_000_000_000_000_000_000 wei == 1_000_000 ether"
  mether
  "1 gether == 1_000_000_000_000_000_000_000_000_000 wei == 1_000_000_000 ether"
  gether
  "1 tether == 1_000_000_000_000_000_000_000_000_000_000 wei == 1_000_000_000_000 ether"
  tether
}

"""
BigInt is a large integer. Input is accepted as either a JSON number or as a string.
"""
scalar BigInt

"""
Bytes is an arbitrary length binary string, represented as a 0x-prefixed hexadecimal.
An empty byte string is represented as '0x'. Byte strings must have an even number of
hexadecimal nybbles
"""
scalar Bytes

"""
Long is a 64 bit unsigned integer
"""
scalar Long

"""
Bytes32 is a 32 byte binary string, represented as 0x-prefixed hexadecimal
"""
scalar Bytes32


"""
Address is a 20 byte Ethereum address, represented as 0x-prefixed hexadecimal
"""
scalar Address

scalar BlockNumber
`;
