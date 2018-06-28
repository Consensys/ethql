import { testGraphql } from '../utils';

const { execQuery, prepareContext } = testGraphql();

test('batching: requests are batched', async () => {
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
  const spy = jest.spyOn(context.web3.currentProvider, 'send');

  await execQuery(query, context);
  expect(spy).toHaveBeenCalledTimes(2);
});

test('batching: requests are not batched', async () => {
  const { execQuery, prepareContext } = testGraphql({ batching: false });
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
  const spy = jest.spyOn(context.web3.currentProvider, 'send');

  await execQuery(query);
  expect(spy).toHaveBeenCalledTimes(110);
});
