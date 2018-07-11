import * as _ from 'lodash';
import { JsonRpcRequest } from 'web3/providers';
import { testGraphql, TestMode } from '../utils';

const cryptoKittiesAddr = '0x06012c8cf97BEaD5deAe237070F9587f8E7A266d'.toLowerCase();

test('caching: request-scoped cached in use', async () => {
  const { execQuery, prepareContext } = testGraphql();
  const context = prepareContext();
  const spy = jest.spyOn(context.web3.currentProvider, 'send');

  const query = `
    {
      block(number: 5400000) {
        transactions {
          to {
            address
            balance
          }
        }
      }
    }
  `;

  await execQuery(query, context);
  const getBalanceCalls = spy.mock.calls[1][0].filter((call: JsonRpcRequest) => call.method === 'eth_getBalance');
  const callsPerAddr = _.countBy(getBalanceCalls, (call: JsonRpcRequest) => call.params[0]);
  expect(callsPerAddr[cryptoKittiesAddr]).toBe(1);
});

test('caching: request-scoped cached not in use', async () => {
  const { execQuery, prepareContext } = testGraphql({ configOverride: { caching: false } });

  const context = prepareContext();
  const spy = jest.spyOn(context.web3.currentProvider, 'send');

  const query = `
    {
      block(number: 5400000) {
        transactions {
          to {
            address
            balance
          }
        }
      }
    }
  `;

  await execQuery(query, context);
  const getBalanceCalls = spy.mock.calls[1][0].filter((call: JsonRpcRequest) => call.method === 'eth_getBalance');
  const callsPerAddr = _.countBy(getBalanceCalls, (call: JsonRpcRequest) => call.params[0]);
  expect(callsPerAddr[cryptoKittiesAddr]).toBeGreaterThan(1);
});

test('caching: cache is not shared across requests', async () => {
  const { execQuery, prepareContext } = testGraphql({ mode: TestMode.passthrough });

  const query = `
    {
      block(number: 5400000) {
        hash
      }
    }
  `;

  let context = prepareContext();
  // The provider will be reused across queries, so we can set the spy only once.
  let spy = jest.spyOn(context.web3.currentProvider, 'send');

  await execQuery(query, context);
  // Ensure a new context is passed, as is the case when processing HTTP requests.
  await execQuery(query, prepareContext());
  await execQuery(query, prepareContext());

  // eth_getBlockByNumber was called thrice, one per request.
  const getBlockCalls = _.flatMap(spy.mock.calls, call => call[0]) //
    .filter((c: JsonRpcRequest) => c.method === 'eth_getBlockByNumber');
  expect(getBlockCalls.length).toBe(3);
});
