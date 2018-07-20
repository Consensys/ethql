import { testGraphql } from '../utils';

const { execQuery } = testGraphql();
const contractAddress = '"0xbbb1bd2d741f05e144e6c4517676a15554fd4b8d"';

test('account->storage: retrieve basic value from storage', async () => {
  const query = `
  {
    account(address: ${contractAddress}) {
      contract(standard: "ERC20") {
        ... on ERC20Contract {
          standard
          entity
          totalSupply
          symbol
        }
      }
    }
  }
  `;

  const expected = {
    data: {
      account: {
        contract: {
          standard: 'ERC20',
          entity: 'token',
          symbol: 'FUN',
          totalSupply: expect.any(Number),
        },
      },
    },
  };

  const result = await execQuery(query);
  expect(result).toEqual(expected);
});
