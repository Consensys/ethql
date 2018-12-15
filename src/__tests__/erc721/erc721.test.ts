import core from '../../core';
import erc165 from '../../erc165';
import erc20 from '../../erc20';
import erc721 from '../../erc721';
import { testGraphql } from '../utils';

const { execQuery } = testGraphql({ optsOverride: { plugins: [core, erc165, erc721] } });

test('erc721: nftToken balanceOf query #1', async () => {
  const query = `
  {
    account(address: "0x6EbeAf8e8E946F0716E6533A6f2cefc83f60e8Ab") {
      nftToken {
        balanceOf(owner: "0xD418c5d0c4a3D87a6c555B7aA41f13EF87485Ec6")
      }
    }
  }
  `;
  const result = await execQuery(query);
  expect(result.errors).toBeUndefined();
  expect(result.data).not.toBeUndefined();

  expect(result.data).toEqual({
    account: {
      nftToken: {
        balanceOf: 0,
      },
    },
  });
});

test('erc721: nftToken balanceOf query #2', async () => {
  const query = `
  {
    account(address: "0x6EbeAf8e8E946F0716E6533A6f2cefc83f60e8Ab") {
      nftToken {
        balanceOf(owner: "0x6f00cE7253bFD3A5A1c307b5E13814BF3433C72f")
      }
    }
  }
  `;
  const result = await execQuery(query);
  expect(result.errors).toBeUndefined();
  expect(result.data).not.toBeUndefined();

  expect(result.data).toEqual({
    account: {
      nftToken: {
        balanceOf: 5,
      },
    },
  });
});

test('erc721: nftToken ownerOf query', async () => {
  const query = `
  {
    account(address: "0x6EbeAf8e8E946F0716E6533A6f2cefc83f60e8Ab") {
      nftToken {
        ownerOf(tokenId: 143880)
      }
    }
  }
  `;
  const result = await execQuery(query);
  expect(result.errors).toBeUndefined();
  expect(result.data).not.toBeUndefined();

  expect(result.data).toEqual({
    account: {
      nftToken: {
        ownerOf: '0x6f00cE7253bFD3A5A1c307b5E13814BF3433C72f',
      },
    },
  });
});

test('erc721: nftToken getApproved query', async () => {
  const query = `
  {
    account(address:"0x6EbeAf8e8E946F0716E6533A6f2cefc83f60e8Ab") {
      nftToken {
        getApproved(tokenId: 33525)
      }
    }
  }
  `;
  const result = await execQuery(query);
  expect(result.errors).toBeUndefined();
  expect(result.data).not.toBeUndefined();

  expect(result.data).toEqual({
    account: {
      nftToken: {
        getApproved: '0x0000000000000000000000000000000000000000',
      },
    },
  });
});

test('erc721: nftToken isApprovedForAll query', async () => {
  const query = `
  {
    account(address:"0x6EbeAf8e8E946F0716E6533A6f2cefc83f60e8Ab") {
      nftToken {
        isApprovedForAll(owner: "0xb85e9bdfCA73a536BE641bB5eacBA0772eA3E61E", operator: "0xD418c5d0c4a3D87a6c555B7aA41f13EF87485Ec6")
      }
    }
  }
  `;
  const result = await execQuery(query);
  expect(result.errors).toBeUndefined();
  expect(result.data).not.toBeUndefined();

  expect(result.data).toEqual({
    account: {
      nftToken: {
        isApprovedForAll: false,
      },
    },
  });
});

//44

test('erc721: not decodable', async () => {
  const query = `
    {
      block(number: 5000000) {
        hash
        transactionAt(index: 66) {
          value
          decoded {
            standard
            operation
            ... on ERC721TransferFrom {
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
              tokenId
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

test('erc721: decode transfer log', async () => {
  const query = `
  {
    transaction(hash: "0x5e9e7570cde63860a7cb71542729deb6d4dd796af70bb464050ca06ec7fc4bc9") {
      hash
      logs{
        decoded {
          ... on ERC721TransferEvent{
                from {
                  account {
                    address
                  }
                }
                to {
                  account {
                    address
                  }
                },
                tokenId
          }
        }
      }
    }
  }`;

  const result = await execQuery(query);
  expect(result.errors).toBeUndefined();
  expect(result.data).not.toBeUndefined();

  const tranferLog = result.data.transaction.logs[0];
  expect(tranferLog).toEqual({
    decoded: {
      from: {
        account: {
          address: '0x0000000000000000000000000000000000000000',
        },
      },
      to: {
        account: {
          address: '0xc93227eee6e77db998a1ff5b01049fec8a5694cc',
        },
      },
      tokenId: 43820,
    },
  });
});
