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
                account {
                  address
                }
              }
              to {
                account {
                  address
                }
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
                account {
                  address
                }
              }
              to {
                account {
                  address
                }
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
      account: {
        address: '0xBaA705866f77Af9194A8a91B8104438b20272958',
      },
    },
    to: {
      account: {
        address: '0xf477dc44297101ab68e7f05936d8f0810a223878',
      },
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
                account {
                  address
                }
              }
              spender {
                account {
                  address
                }
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
      account: {
        address: '0xdE85906e9d436D8705aAC205cb19350C0AA9655F',
      },
    },
    spender: {
      account: {
        address: '0x8d12a197cb00d4747a1fe03395095ce2a5cc6819',
      },
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
                account {
                  address
                }
              }
              to {
                account {
                  address
                }
              }
              spender {
                account {
                  address
                }
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
      account: {
        address: '0x7d849b947da6de041fe289e307ac3132e14a6c5f',
      },
    },
    to: {
      account: {
        address: '0x0d6b5a54f940bf3d52e438cab785981aaefdf40c',
      },
    },
    spender: {
      account: {
        address: '0x0D6B5A54F940BF3D52E438CaB785981aAeFDf40C',
      },
    },
    value: '22000000000000000000',
  };

  const tx = result.data.block.transactionAt;
  expect(tx.value).toBe(0);
  expect(tx.decoded).toEqual(decoded);
});

test('erc20: fetch symbol and totalSupply', async () => {
  const query = `
    {
      block(number: 5600000) {
        transactionAt(index: 2) {
          index
          decoded {
            standard
            operation
            ... on ERC20Transfer {
              tokenContract {
                symbol
                totalSupply
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
              }
              value
            }
          }
        }
      }
    }`;

  const result = await execQuery(query);
  expect(result.errors).toBeUndefined();
  expect(result.data).not.toBeUndefined();

  const decoded = {
    standard: 'ERC20',
    operation: 'transfer',
    tokenContract: {
      symbol: 'NULS',
      totalSupply: 4e25,
    },
    from: {
      account: {
        address: '0xbcCA7f6Fd6D7ea2755E83ac78A853793efbaA512',
      },
    },
    to: {
      account: {
        address: '0x6cc5f688a315f3dc28a7781717a9a798a59fda7b',
      },
    },
    value: '2.814408939999999999999e+21',
  };

  const tx = result.data.block.transactionAt;
  expect(tx.decoded).toEqual(decoded);
});

test('erc20: fetch null symbol', async () => {
  const query = `
    {
      block(number: 5600000) {
        transactionAt(index: 11) {
          index
          decoded {
            standard
            operation
            ... on ERC20Transfer {
              tokenContract {
                symbol
                totalSupply
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
              }
              value
            }
          }
        }
      }
    }`;

  const result = await execQuery(query);
  expect(result.errors).toBeUndefined();
  expect(result.data).not.toBeUndefined();

  const decoded = {
    standard: 'ERC20',
    operation: 'transfer',
    tokenContract: {
      symbol: null,
      totalSupply: 1e27,
    },
    from: {
      account: {
        address: '0x6748F50f686bfbcA6Fe8ad62b22228b87F31ff2b',
      },
    },
    to: {
      account: {
        address: '0x7a7e781c707aafc6406b8d7dcdf738a49469aca2',
      },
    },
    value: '99500000000000000000',
  };

  const tx = result.data.block.transactionAt;
  expect(tx.decoded).toEqual(decoded);
});

test('erc20: fetch token balance of recipient (account 0x0)', async () => {
  const query = `
    {
      block(number: 5875781) {
        transactionsInvolving(participants:["0xb5a5f22694352c15b00323844ad545abb2b11028"]) {
          index
          decoded {
            standard
            operation
            ... on ERC20Transfer {
              tokenContract {
                account {
                  address
                }
                symbol
                totalSupply
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
    }`;

  const result = await execQuery(query);
  expect(result.errors).toBeUndefined();
  expect(result.data).not.toBeUndefined();

  const tx = result.data.block.transactionsInvolving[0];
  expect(tx.decoded.standard).toEqual('ERC20');
  expect(tx.decoded.operation).toEqual('transfer');
  expect(tx.decoded.tokenContract.account.address).toEqual('0xb5A5F22694352C15B00323844aD545ABb2B11028');
  expect(tx.decoded.to.account.address).toEqual('0x0000000000000000000000000000000000000000');
  expect(tx.decoded.to.tokenBalance).toBeGreaterThan(0);
});

test('erc20: decode transfer log', async () => {
  const query = `
  {
    block(number: 5000000) {
      hash
      transactionAt(index: 1) {
        logs {
          decoded {
            entity
            standard
            event
            ... on ERC20TransferEvent {
              from {
                account {
                  address
                }
              }
              to {
                account {
                  address
                }
              }
              value
            }
          }
        }
      }
    }
  }`;

  const result = await execQuery(query);
  expect(result.errors).toBeUndefined();
  expect(result.data).not.toBeUndefined();
  expect(result.data).toEqual({
    block: {
      hash: '0x7d5a4369273c723454ac137f48a4f142b097aa2779464e6505f1b1c5e37b5382',
      transactionAt: {
        logs: [
          {
            decoded: {
              entity: 'token',
              standard: 'ERC20',
              event: 'Transfer',
              from: {
                account: {
                  address: '0x0681d8db095565fe8a346fa0277bffde9c0edbbf',
                },
              },
              to: {
                account: {
                  address: '0xf53354a8dc35416d28ab2523589d1b44843e025c',
                },
              },
              value: '2845545516000000000000',
            },
          },
        ],
      },
    },
  });
});

test('erc20: decode approval log', async () => {
  const query = `
    {
      block(number: 5000000) {
        hash
        transactionAt(index: 14) {
          index
          logs {
            decoded {
              entity
              standard
              event
              ... on ERC20ApprovalEvent {
                owner {
                  account {
                    address
                  }
                }
                spender {
                  account {
                    address
                  }
                }
                value
              }
            }
          }
        }
      }
    }`;

  const result = await execQuery(query);
  expect(result.errors).toBeUndefined();
  expect(result.data).not.toBeUndefined();
  expect(result.data).toEqual({
    block: {
      hash: '0x7d5a4369273c723454ac137f48a4f142b097aa2779464e6505f1b1c5e37b5382',
      transactionAt: {
        index: 14,
        logs: [
          {
            decoded: {
              entity: 'token',
              standard: 'ERC20',
              event: 'Approval',
              owner: {
                account: {
                  address: '0x088b9099eae5f372405a29a7077faf3a82f94e05',
                },
              },
              spender: {
                account: {
                  address: '0x4bf50be697f1b2c23b44005feaa5c98f13e6b6d6',
                },
              },
              value: '1800000000000000000000000',
            },
          },
        ],
      },
    },
  });
});
