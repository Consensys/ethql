import { CORE_PLUGIN } from '@ethql/core';
import { testGraphql } from '@ethql/plugin';
import { ERC20_PLUGIN } from '..';

test('batching: eth_calls are batched', async () => {
  const { execQuery, prepareContext } = testGraphql({ opts: { plugins: [CORE_PLUGIN, ERC20_PLUGIN] } });

  const query = `
    {
      block(number: 5000000) {
        hash
        transactions {
          decoded {
            ... on ERC20Transfer {
              from {
                account {
                  address
                }
                tokenBalance
              }
            }
          }
        }
      }
    }`;

  const context = prepareContext();
  const spy = jest.spyOn(context.services.web3.currentProvider, 'send');

  await execQuery(query, context);
  expect(spy).toHaveBeenCalledTimes(2);
});
