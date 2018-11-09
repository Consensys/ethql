import core from '../../core';
import erc165 from '../../erc165';
import erc20 from '../../erc20';
import erc721 from '../../erc721';
import { testGraphql } from '../utils';

const { execQuery } = testGraphql({ optsOverride: { plugins: [core, erc20, erc165, erc721] } });

test('erc721: nftToken balanceOf query #1', async () => {
  const query = `
  {
    nftToken(address:"0x06012c8cf97BEaD5deAe237070F9587f8E7A266d") {
      balanceOf(owner: "0xD418c5d0c4a3D87a6c555B7aA41f13EF87485Ec6")
    }
  }
  `;
  const result = await execQuery(query);
  expect(result.errors).toBeUndefined();
  expect(result.data).not.toBeUndefined();

  expect(result.data).toEqual({
    nftToken: {
      balanceOf: 0,
    },
  });
});

test('erc721: nftToken balanceOf query #2', async () => {
  const query = `
  {
    nftToken(address:"0x06012c8cf97BEaD5deAe237070F9587f8E7A266d") {
      balanceOf(owner: "0x595a6aA36Ab9fFB4b5940D4E189d6F2AB3958aeb")
    }
  }
  `;
  const result = await execQuery(query);
  expect(result.errors).toBeUndefined();
  expect(result.data).not.toBeUndefined();

  expect(result.data).toEqual({
    nftToken: {
      balanceOf: 72,
    },
  });
});

test('erc721: nftToken ownerOf query', async () => {
  const query = `
  {
    nftToken(address:"0x06012c8cf97BEaD5deAe237070F9587f8E7A266d") {
      ownerOf(tokenId: 384978)
    }
  }
  `;
  const result = await execQuery(query);
  expect(result.errors).toBeUndefined();
  expect(result.data).not.toBeUndefined();

  expect(result.data).toEqual({
    nftToken: {
      ownerOf: '0x595a6aA36Ab9fFB4b5940D4E189d6F2AB3958aeb',
    },
  });
});

test('erc721: nftToken getApproved query', async () => {
  const query = `
  {
    nftToken(address:"0x6EbeAf8e8E946F0716E6533A6f2cefc83f60e8Ab") {
      getApproved(tokenId: 33525)
    }
  }
  `;
  const result = await execQuery(query);
  expect(result.errors).toBeUndefined();
  expect(result.data).not.toBeUndefined();

  expect(result.data).toEqual({
    nftToken: {
      getApproved: '0x0000000000000000000000000000000000000000',
    },
  });
});

test('erc721: nftToken isApprovedForAll query', async () => {
  const query = `
  {
    nftToken(address:"0x6EbeAf8e8E946F0716E6533A6f2cefc83f60e8Ab") {
      isApprovedForAll(owner: "0xb85e9bdfCA73a536BE641bB5eacBA0772eA3E61E", operator: "0xD418c5d0c4a3D87a6c555B7aA41f13EF87485Ec6")
    }
  }
  `;
  const result = await execQuery(query);
  expect(result.errors).toBeUndefined();
  expect(result.data).not.toBeUndefined();

  expect(result.data).toEqual({
    nftToken: {
      isApprovedForAll: false,
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
//
// test('erc721: decode transfer log', async () => {
//   const query = `
//   {
//     block(number: 5000000) {
//       hash
//       transactionAt(index: 64) {
//         logs {
//           decoded {
//             entity
//             standard
//             event
//             ... on ERC721TransferEvent {
//               from {
//                 account {
//                   address
//                 }
//               }
//               to {
//                 account {
//                   address
//                 }
//               }
//               tokenId
//             }
//           }
//         }
//       }
//     }
//   }`;
//
//   const result = await execQuery(query);
//   expect(result.errors).toBeUndefined();
//   expect(result.data).not.toBeUndefined();
//
//   expect(result.data).toEqual({
//     block: {
//       hash: '0x7d5a4369273c723454ac137f48a4f142b097aa2779464e6505f1b1c5e37b5382',
//       transactionAt: {
//         logs: [
//           {
//             decoded: {
//               entity: 'token',
//               standard: 'ERC721',
//               event: 'Transfer',
//               from: {
//                 account: {
//                   address: '0x89eacd3f14e387faa9f3d1f3f917ebdf8221d430',
//                 },
//               },
//               to: {
//                 account: {
//                   address: '0xb1690c08e213a35ed9bab7b318de14420fb57d8c',
//                 },
//               },
//               tokenId: 489475,
//             },
//           },
//           {
//             decoded: null,
//           },
//         ],
//       },
//     },
//   });
// });

//
// test('erc721: transfer transaction', async () => {
//   const query = `
//     {
//       block(number: 5000000) {
//         hash
//         transactionAt(index: 64) {
//           value
//           hash
//           decoded {
//             standard
//             operation
//             ... on ERC721TransferFrom {
//               from {
//                 account {
//                   address
//                 }
//               }
//               to {
//                 account {
//                   address
//                 }
//               }
//               tokenId
//             }
//           }
//         }
//       }
//     }
//   `;
//
//   const result = await execQuery(query);
//   console.log(result.data);
//
//   expect(result.errors).toBeUndefined();
//   expect(result.data).not.toBeUndefined();
//
//   const decoded = {
//     standard: 'ERC721',
//     operation: 'transfer',
//     from: {
//       account: {
//         address: '0x89eAcD3F14e387faA9F3D1F3f917eBdf8221D430',
//       },
//     },
//     to: {
//       account: {
//         address: '0xb1690C08E213a35Ed9bAb7B318DE14420FB57d8C',
//       },
//     },
//     tokenId: '489475',
//   };
//
//   const tx = result.data.block.transactionAt;
//   console.log(tx);
//   expect(tx.value).toBe(0);
//   expect(tx.decoded).toEqual(decoded);
// });
