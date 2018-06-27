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
  const units =  {'wei': 1,
                  'kwei': 1000, 'babbage': 1000, 'femtoether': 1000,
                  'mwei': 1000000, 'lovelace': 1000000, 'picoether': 1000000,
                  'gwei': 1000000000, 'shannon': 1000000000, 'nanoether': 1000000000, 'nano': 1000000000,
                  'microether': 1000000000000, 'micro': 1000000000000, 'szabo': 1000000000000,
                  'milliether': 1000000000000000, 'milli': 1000000000000000, 'finney': 1000000000000000,
                  'ether': 1000000000000000000,
                  'kether': 1000000000000000000000, 'grand': 1000000000000000000000,
                  'mether': 1000000000000000000000000,
                  'gether': 1000000000000000000000000000,
                  'tether': 1000000000000000000000000000000};

  let wei;
  for (const unit of Object.keys(units)) {
    const query = `
    {
      account(address: "0x0000000000000000000000000000000000000000") {
        balance(unit:` + unit + `)
      }
    }
    `;
    const result = await execQuery(query);
    if (!wei) { wei = result.data.account.balance; }
    expect(result.data.account.balance).toEqual(wei / units[unit]);
    expect(result.errors).toBeUndefined();
  }
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
