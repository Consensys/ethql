import { testGraphql } from '../utils';

const { execQuery } = testGraphql();

test('block->miner: successfully returns miner account', async () => {
  const query = `
    {
      block(number: 5771878) {
        miner {
          address
          type
        }
        parent {
          miner {
            address
          }
        }
      }
    }`;

  const expected = {
    data: {
      block: {
        miner: {
          address: '0x829BD824B016326A401d083B33D092293333A830',
          type: 'EXTERNALLY_OWNED',
        },
        parent: {
          miner: {
            address: '0xb2930B35844a230f00E51431aCAe96Fe543a0347',
          },
        },
      },
    },
  };
  const result = await execQuery(query);
  expect(result).toEqual(expected);
});
