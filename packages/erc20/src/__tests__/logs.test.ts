import { CORE_PLUGIN } from '@ethql/core';
import { testGraphql } from '@ethql/plugin';
import { ERC20_PLUGIN } from '..';

test('logs: transaction with both decodable and non-decodable logs', async () => {
  const { execQuery } = testGraphql({ opts: { plugins: [CORE_PLUGIN, ERC20_PLUGIN] } });

  const query = `
    {
      block(number: 5000000) {
        hash
        transactionAt(index: 2) {
          index
          logs {
            decoded {
              entity
              standard
              event
            }
          }
        }
      }
    }
  `;

  const result = await execQuery(query);
  expect(result.errors).toBeUndefined();
  expect(result.data).toEqual({
    block: {
      hash: '0x7d5a4369273c723454ac137f48a4f142b097aa2779464e6505f1b1c5e37b5382',
      transactionAt: {
        index: 2,
        logs: [
          {
            decoded: null,
          },
          {
            decoded: {
              entity: 'token',
              standard: 'ERC20',
              event: 'Transfer',
            },
          },
        ],
      },
    },
  });
});
