import { testGraphql } from '../utils';

const { execQuery } = testGraphql();

test('block->miner: successfully returns miner account', async () => {
  const query = `
    {
      block(number: 5771878) {
        miner {
          address
          code
        }
      }
    }`;

  const expected = {
    data: {
      block: {
        miner: {
          address: '0x829BD824B016326A401d083B33D092293333A830',
          code: null,
        },
      },
    },
  };
  const result = await execQuery(query);
  expect(result).toEqual(expected);
});
