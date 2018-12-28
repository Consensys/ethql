export default `
interface ERC20Transaction {
  tokenContract: ERC20TokenContract
}

type ERC20Transfer implements DecodedTransaction & ERC20Transaction {
  entity: Entity
  standard: String
  operation: String
  from: ERC20TokenHolder
  to: ERC20TokenHolder
  value: String
  tokenContract: ERC20TokenContract
}

type ERC20TransferFrom implements DecodedTransaction & ERC20Transaction {
  entity: Entity
  standard: String
  operation: String
  from: ERC20TokenHolder
  to: ERC20TokenHolder
  value: String
  spender: ERC20TokenHolder
  tokenContract: ERC20TokenContract
}

type ERC20Approve implements DecodedTransaction & ERC20Transaction {
  entity: Entity
  standard: String
  operation: String
  from: ERC20TokenHolder
  spender: ERC20TokenHolder
  value: String
  tokenContract: ERC20TokenContract
}

type ERC20TransferEvent implements DecodedLog {
  entity: Entity
  standard: String
  event: String
  from: ERC20TokenHolder
  to: ERC20TokenHolder
  value: String
}

type ERC20ApprovalEvent implements DecodedLog {
  entity: Entity
  standard: String
  event: String
  owner: ERC20TokenHolder
  spender: ERC20TokenHolder
  value: String
}
`;
