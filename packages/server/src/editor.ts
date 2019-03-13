export const WELCOME_QUERY = `{
  block(number: 5000000) {
    hash
    transactionCount
    transactions(filter: { withInput: true }) {
      hash
      from {
        address
      }
      to {
        address
      }
      value
      decoded {
        entity
        standard
        operation
        ... on ERC20Transfer {
          tokenContract {
            symbol
          }
          from {
            account {
              address
            }
          }
          to {
            account {
              address
            }
            tokenBalance
          }
          value
        }
      }
    }
  }
}
`;
