import * as _ from 'lodash';
import { testGraphql } from '../utils';

const { execQuery } = testGraphql();

test('logs: fetch logs from all transactions', async () => {
  const query = `
    {
      block(number: 5000000) {
        transactions {
          logs {
            index
          }
        }
      }
    }
  `;

  const result = await execQuery(query);
  expect(result.errors).toBeUndefined();
  const indices = _.flatMap(result.data.block.transactions, t => t.logs).map(l => l.index);
  expect(indices).toEqual(_.range(209));
});

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
              miner {
                address
              }
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
              miner: {
                address: '0xb2930B35844a230f00E51431aCAe96Fe543a0347',
              },
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

test('logs: fetch from top-level transaction', async () => {
  const query = `
    {
      transaction(hash: "0x696a35492b283624ccf4ae9438ae2d5d5e84a4a00798155b568d1eb52606d829") {
        to {
          address
        }
        logs {
          index
          account {
            address
          }
        }
      }
    }`;

  const expected = {
    transaction: {
      to: {
        address: '0xD850942eF8811f2A866692A623011bDE52a462C1',
      },
      logs: [
        {
          index: 0,
          account: {
            address: '0xD850942eF8811f2A866692A623011bDE52a462C1',
          },
        },
      ],
    },
  };

  const result = await execQuery(query);
  expect(result.errors).toBeUndefined();
  expect(result.data).toEqual(expected);
});

test('logs: transaction with both decodable and non-decodable logs', async () => {
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

test('logs: transaction with no logs', async () => {
  const query = `
    {
      block(number: 5000000) {
        hash
        transactionAt(index: 3) {
          index
          logs {
            index
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
        index: 3,
        logs: [],
      },
    },
  });
});
