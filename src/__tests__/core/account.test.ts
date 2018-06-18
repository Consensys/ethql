import { testGraphql } from '../utils';

const { execQuery } = testGraphql();

test('account: select by address', async () => {
  const query = `
    {
      account(address: "0x0000000000000000000000000000000000000000") {
        code
        transactionCount
      }
    }
  `;

  const expected = { data: { account: { code: '0x', transactionCount: 0 } } };
  const result = await execQuery(query);
  expect(result).toEqual(expected);
});

test('account: error when address is invalid', async () => {
  const query = `
    {
      account(address: "0x1234") {
        code
        transactionCount
      }
    }
  `;

  const result = await execQuery(query);
  expect(result.errors).toHaveLength(1);
  expect(result.errors[0].message).toMatch(/^Expected type Address\!/);
});

test('account: select account balance', async () => {
  const query = `
    {
      account(address: "0xF7c74BBC9b7e643193d46D9889538899321e5712") {
        balance
      }
    }
  `;

  const expected = { data: { account: { balance: 201749298394112000 } } };
  const result = await execQuery(query);
  expect(result).toEqual(expected);
});
