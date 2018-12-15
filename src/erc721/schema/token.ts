export default `

extend type Account {
  "Selects an account."
  nftToken: ERC721TokenContract
}

type ERC721TokenHolder {
  account: Account!
  tokenBalance: Long
}

type ERC721TokenContract {
  account: Account
  ownerOf(tokenId: Long): String
  balanceOf(owner: String): Long
  getApproved(tokenId: Long): String
  isApprovedForAll(owner: String, operator: String): Boolean
}
`;
