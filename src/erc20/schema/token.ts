export default `
type ERC20TokenHolder {
  account: Account!
  tokenBalance: Long
}

type ERC20TokenContract {
  account: Account
  symbol: String
  totalSupply: Long
}
`;
