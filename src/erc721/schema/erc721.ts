export default `
interface ERC721Transaction {
  tokenContract: ERC721TokenContract
}

type ERC721SafeTransferFrom implements DecodedTransaction & ERC721Transaction {
  entity: Entity
  standard: String
  operation: String
  from: ERC721TokenHolder
  to: ERC721TokenHolder
  tokenId: Long
  tokenContract: ERC721TokenContract
}

type ERC721TransferFrom implements DecodedTransaction & ERC721Transaction {
  entity: Entity
  standard: String
  operation: String
  from: ERC721TokenHolder
  to: ERC721TokenHolder
  tokenId: Long
  tokenContract: ERC721TokenContract
}

type ERC721Approve implements DecodedTransaction & ERC721Transaction {
  entity: Entity
  standard: String
  operation: String
  approved: ERC721TokenHolder
  tokenId: Long
  tokenContract: ERC721TokenContract
}

type ERC721SetApprovalForAll implements DecodedTransaction & ERC721Transaction {
  entity: Entity
  standard: String
  operation: String
  operator: ERC721TokenHolder
  approved: Boolean
  tokenContract: ERC721TokenContract
}

type ERC721TransferEvent implements DecodedLog {
  entity: Entity
  standard: String
  event: String
  from: ERC721TokenHolder
  to: ERC721TokenHolder
  tokenId: Long
}

type ERC721ApprovalEvent implements DecodedLog {
  entity: Entity
  standard: String
  event: String
  owner: ERC721TokenHolder
  approved: ERC721TokenHolder
  tokenId: Long
}

type ERC721ApprovalForAllEvent implements DecodedLog {
  entity: Entity
  standard: String
  event: String
  owner: ERC721TokenHolder
  operator: ERC721TokenHolder
  approved: Boolean
}
`;
