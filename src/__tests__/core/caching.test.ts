import * as _ from 'lodash';
import { JsonRpcRequest } from 'web3/providers';
import { testGraphql } from '../utils';

const { execQuery, context } = testGraphql();

const cryptoKittiesAddr = '0x06012c8cf97BEaD5deAe237070F9587f8E7A266d'.toLowerCase();

test('caching: request-scoped cached in use', async () => {
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

  await execQuery(query);
  const getBalanceCalls = spy.mock.calls[1][0].filter((call: JsonRpcRequest) => call.method === 'eth_getBalance');
  const callsPerAddr = _.countBy(getBalanceCalls, (call: JsonRpcRequest) => call.params[0]);
  expect(callsPerAddr[cryptoKittiesAddr]).toBe(1);
});

test('caching: request-scoped cached not in use', async () => {
  const { execQuery, context } = testGraphql({ caching: false });
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

  await execQuery(query);
  const getBalanceCalls = spy.mock.calls[1][0].filter((call: JsonRpcRequest) => call.method === 'eth_getBalance');
  const callsPerAddr = _.countBy(getBalanceCalls, (call: JsonRpcRequest) => call.params[0]);
  expect(callsPerAddr[cryptoKittiesAddr]).toBeGreaterThan(1);
});
