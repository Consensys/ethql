import { testGraphql } from '../utils';

const { execQuery, context } = testGraphql();

test('batching: requests are batched', async () => {
  const spy = jest.spyOn(context.web3.currentProvider, 'send');
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

  await execQuery(query);
  expect(spy).toHaveBeenCalledTimes(2);
});

test('batching: requests are not batched', async () => {
  const { execQuery, context } = testGraphql({ batching: false });
  const spy = jest.spyOn(context.web3.currentProvider, 'send');
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

  await execQuery(query);
  expect(spy).toHaveBeenCalledTimes(110);
});
