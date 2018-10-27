export default `
type ERC721TokenContract {
  account: Account
  symbol: String
  totalSupply: Long
  ownerOf(tokenId: Long): Account
}
`;
