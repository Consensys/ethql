import { testGraphql } from '../utils';

const { execQuery } = testGraphql();

test('erc20: not decodable', async () => {
  const query = `
    {
      block(number: 5000000) {
        hash
        transactionAt(index: 66) {
          value
          decoded {
            standard
            operation
            ... on ERC20Transfer {
              from {
                address
              }
              to {
                address
              }
              value
            }
          }
        }
      }
    }
  `;

  const result = await execQuery(query);
  expect(result.errors).toBeUndefined();
  expect(result.data).not.toBeUndefined();

  const tx = result.data.block.transactionAt;
  expect(tx.value).toBeGreaterThan(0);
  expect(tx.decoded).toEqual(null);
});

test('erc20: transfer transaction', async () => {
  const query = `
    {
      block(number: 5000000) {
        hash
        transactionAt(index: 67) {
          value
          decoded {
            standard
            operation
            ... on ERC20Transfer {
              from {
                address
              }
              to {
                address
              }
              value
            }
          }
        }
      }
    }
  `;

  const result = await execQuery(query);
  expect(result.errors).toBeUndefined();
  expect(result.data).not.toBeUndefined();

  const decoded = {
    standard: 'ERC20',
    operation: 'transfer',
    from: {
      address: '0xBaA705866f77Af9194A8a91B8104438b20272958',
    },
    to: {
      address: '0xf477dc44297101ab68e7f05936d8f0810a223878',
    },
    value: '121299942024',
  };

  const tx = result.data.block.transactionAt;
  expect(tx.value).toBe(0);
  expect(tx.decoded).toEqual(decoded);
});

test('erc20: approval transaction', async () => {
  const query = `
    {
      block(number: 5600001) {
        transactionAt(index: 70) {
          value
          decoded {
            standard
            operation
            ... on ERC20Approve {
              from {
                address
              }
              spender {
                address
              }
              value
            }
          }
        }
      }
    }
  `;

  const result = await execQuery(query);
  expect(result.errors).toBeUndefined();
  expect(result.data).not.toBeUndefined();

  const decoded = {
    standard: 'ERC20',
    operation: 'approve',
    from: {
      address: '0xdE85906e9d436D8705aAC205cb19350C0AA9655F',
    },
    spender: {
      address: '0x8d12a197cb00d4747a1fe03395095ce2a5cc6819',
    },
    value: '1816000000000000000',
  };

  const tx = result.data.block.transactionAt;
  expect(tx.value).toBe(0);
  expect(tx.decoded).toEqual(decoded);
});

test('erc20: transferFrom transaction', async () => {
  const query = `
    {
      block(number: 5600014) {
        number
        transactionAt(index: 43) {
          value
          decoded {
            standard
            operation
            ... on ERC20TransferFrom {
              from {
                address
              }
              to {
                address
              }
              spender {
                address
              }
              value
            }
          }
        }
      }
    }
  `;

  const result = await execQuery(query);
  expect(result.errors).toBeUndefined();
  expect(result.data).not.toBeUndefined();

  const decoded = {
    standard: 'ERC20',
    operation: 'transferFrom',
    from: {
      address: '0x7d849b947da6de041fe289e307ac3132e14a6c5f',
    },
    to: {
      address: '0x0d6b5a54f940bf3d52e438cab785981aaefdf40c',
    },
    spender: {
      address: '0x0D6B5A54F940BF3D52E438CaB785981aAeFDf40C',
    },
    value: '22000000000000000000',
  };

  const tx = result.data.block.transactionAt;
  expect(tx.value).toBe(0);
  expect(tx.decoded).toEqual(decoded);
});
