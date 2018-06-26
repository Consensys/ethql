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
      account(address: "0x0000000000000000000000000000000000000000") {
        balance
      }
    }
  `;

  const result = await execQuery(query);
  expect(result.errors).toBeUndefined();
  expect(result.data.account.balance).toBeGreaterThan(0);
});

test('account: select account balance with unit conversion', async () => {
  const query = `
    {
      account(address: "0x0000000000000000000000000000000000000000") {
        balance(unit: finney)
      }
    }
  `;

  const result = await execQuery(query);
  expect(result.errors).toBeUndefined();
  expect(result.data.account.balance).toBeGreaterThan(0);
});

test('account: error when unit is invalid', async () => {
  const query = `
    {
      account(address: "0x0000000000000000000000000000000000000000") {
        balance(unit: finey)
      }
    }
  `;

  const result = await execQuery(query);
  expect(result.errors).toHaveLength(1);
  expect(result.errors[0].message).toMatch('Expected type Unit, found finey; Did you mean the enum value finney?');
});
