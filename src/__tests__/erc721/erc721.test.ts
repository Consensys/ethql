import core from '../../core';
import erc20 from '../../erc20';
import erc721 from '../../erc721';
import { testGraphql } from '../utils';

const { execQuery } = testGraphql({ optsOverride: { plugins: [core, erc20, erc721] } });
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

test('erc20: decode transfer log', async () => {
  const query = `
  {
    block(number: 5000000) {
      hash
      transactionAt(index: 64) {
        logs {
          decoded {
            entity
            standard
            event
            ... on ERC721TransferEvent {
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
              standard: 'ERC721',
              event: 'Transfer',
              from: {
                account: {
                  address: '0x89eacd3f14e387faa9f3d1f3f917ebdf8221d430',
                },
              },
              to: {
                account: {
                  address: '0xb1690c08e213a35ed9bab7b318de14420fb57d8c',
                },
              },
              tokenId: 489475,
            },
          },
          {
            decoded: null,
          },
        ],
      },
    },
  });
});

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
