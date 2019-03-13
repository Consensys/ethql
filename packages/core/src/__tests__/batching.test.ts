import { EthqlOptions, testGraphql, TestMode } from '@ethql/plugin';
import { CORE_PLUGIN } from '../plugin';

const testServerOpts: EthqlOptions = { plugins: [CORE_PLUGIN] };

test('batching: requests are batched', async () => {
  const { execQuery, prepareContext } = testGraphql({opts: testServerOpts});

  const query = `
    {
      block(number: 5000000) {
        transactions {
          from {
            balance
          }
        }
      }
    }
  `;

  const context = prepareContext();
  const spy = jest.spyOn(context.services.web3.currentProvider, 'send');

  await execQuery(query, context);
  expect(spy).toHaveBeenCalledTimes(2);
});

test('batching: requests are not batched', async () => {
  const { execQuery, prepareContext } = testGraphql({ opts: { config: { batching: false }, plugins: [CORE_PLUGIN] } });
  const query = `
    {
      block(number: 5000000) {
        transactions {
          from {
            balance
          }
        }
      }
    }
  `;

  const context = prepareContext();
  const spy = jest.spyOn(context.services.web3.currentProvider, 'send');

  const resp = await execQuery(query, context);
  expect(resp.errors).toBeUndefined();
  expect(spy).toHaveBeenCalledTimes(110);
});
