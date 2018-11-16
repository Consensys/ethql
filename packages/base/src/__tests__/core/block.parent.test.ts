import { testGraphql } from '../utils';

const { execQuery } = testGraphql();

test('block->parent: successfully returns parent', async () => {
  const query = `
    {
      block(number: 5771878) {
        hash
        parent {
          hash
          timestamp
          transactionsRoles(to: "0xe6642312A3994B307179f8C0537355bFc3026f2c" ) {
            hash
            to {
              address
            }
            from {
              address
            }
          }
        }
      }
    }`;

  const expected = {
    data: {
      block: {
        hash: '0x59e10ec08e0a28ae3d9dbc1fff949816371cde4b40a0203ea33a09db181c3ffc',
        parent: {
          hash: '0x21ee387412a1e069d665bee16600c7720530347cbde0b705ea1c85683844f421',
          timestamp: '1528744982',
          transactionsRoles: [
            {
              hash: '0xfb9768dc2573de609fe808184fc187f47db0696da530593f609883352dcee207',
              to: { address: '0xe6642312A3994B307179f8C0537355bFc3026f2c' },
              from: { address: '0x33376f952e23113bF4eB21eaCB4D6c861087dabF' },
            },
          ],
        },
      },
    },
  };
  const result = await execQuery(query);
  expect(result).toEqual(expected);
});
