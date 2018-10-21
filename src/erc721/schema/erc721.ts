export default `
interface ERC721Transaction {
  tokenContract: TokenContract
}

type ERC721Transfer implements DecodedTransaction & ERC721Transaction {
  entity: Entity
  standard: String
  operation: String
  from: TokenHolder
  to: TokenHolder
  tokenId: Long
  tokenContract: TokenContract
}

type ERC721TransferEvent implements DecodedLog {
  entity: Entity
  standard: String
  event: String
  from: TokenHolder
  to: TokenHolder
  tokenId: Long
}

type ERC721ApprovalEvent implements DecodedLog {
  entity: Entity
  standard: String
  event: String
  owner: TokenHolder
  approved: TokenHolder
  tokenId: Long
}

type ERC721ApprovalForAllEvent implements DecodedLog {
  entity: Entity
  standard: String
  event: String
  owner: TokenHolder
  operator: TokenHolder
  approved: Boolean
}
`;
