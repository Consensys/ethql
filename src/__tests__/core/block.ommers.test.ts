import { testGraphql } from '../utils';

const { execQuery } = testGraphql();

test('block->ommer: successfully returns ommer account', async () => {
  const query = `
      {
        block(number: 5771884) {
          ommers {
            hash
            miner {
              address
            }
          }
        }
      }`;

  const expected = {
    data: {
      block: {
        ommers: [
          {
            hash: '0x239a3ffee425204affbd8aca664ebb6c405c0fb2ccb2bbaf93d9e7c965bd03dc',
            miner: {
              address: '0xb2930B35844a230f00E51431aCAe96Fe543a0347',
            },
          },
          {
            hash: '0xa2f9eb30b20ac5ce0341b4ef9398f19dab0540c8e59245a5b952d3423625b172',
            miner: {
              address: '0xcC16E3c00DBbe76603fa833Ec20A48f786dfE610',
            },
          },
        ],
      },
    },
  };
  const result = await execQuery(query);
  expect(result).toEqual(expected);
});
