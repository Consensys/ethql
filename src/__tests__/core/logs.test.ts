import { testGraphql } from '../utils';

const { execQuery } = testGraphql();

test('logs: fetch all log fields', async () => {
  const query = `
    {
      block(number: 5000000) {
        hash
        transactionAt(index: 1) {
          index
          logs {
            index
            data
            topics
            block {
              number
            }
            account {
              address
            }
            transaction {
              hash
            }
          }
        }
      }
    }`;

  const expected = {
    block: {
      hash: '0x7d5a4369273c723454ac137f48a4f142b097aa2779464e6505f1b1c5e37b5382',
      transactionAt: {
        index: 1,
        logs: [
          {
            index: 0,
            data: '0x00000000000000000000000000000000000000000000009a41e07a74a99ec000',
            topics: [
              '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
              '0x0000000000000000000000000681d8db095565fe8a346fa0277bffde9c0edbbf',
              '0x000000000000000000000000f53354a8dc35416d28ab2523589d1b44843e025c',
            ],
            block: {
              number: 5000000,
            },
            account: {
              address: '0xD850942eF8811f2A866692A623011bDE52a462C1',
            },
            transaction: {
              hash: '0x696a35492b283624ccf4ae9438ae2d5d5e84a4a00798155b568d1eb52606d829',
            },
          },
        ],
      },
    },
  };
  const result = await execQuery(query);
  expect(result.errors).toBeUndefined();
  expect(result.data).toEqual(expected);
});
