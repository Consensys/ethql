import { testGraphql } from '../utils';

const { execQuery, ctxFactory } = testGraphql();

test('account: select by address', async () => {
  const query = `
    {
      account(address: "0x0000000000000000000000000000000000000000") {
        code
        transactionCount
      }
    }
  `;

  const expected = { data: { account: { code: null, transactionCount: 0 } } };
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
  let cmpr; // variable for baseline of comparison, in wei, for conversion
  const { web3 } = ctxFactory.create();
  for (const unit of Object.keys(web3.utils.unitMap)) {
    if (unit === 'noether') {
      continue;
    }
    const query = `
    {
      account(address: "0x0000000000000000000000000000000000000001") {
        balance(unit: ${unit.toLowerCase()})
      }
    }
    `;
    let result = await execQuery(query);
    expect(result.errors).toBeUndefined();
    result = result.data.account.balance.toFixed(5);
    if (!cmpr) {
      cmpr = result;
    } // set baseline of comparison in wei
    expect(result).toEqual((cmpr / web3.utils.unitMap[unit]).toFixed(5)); // compare conversion in wei to baseline
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

test('account->code|type: externally-owned account', async () => {
  const query = `
    {
      account(address: "0xd6cB6744B7f2Da784c5aFd6B023D957188522198") {
        code
        type
      }
    }
  `;

  const result = await execQuery(query);
  expect(result.errors).toBeUndefined();
  expect(result.data.account.code).toBeNull();
  expect(result.data.account.type).toBe('EXTERNALLY_OWNED');
});

test('account->code|type: contract account', async () => {
  const query = `
    {
      account(address: "0xD850942eF8811f2A866692A623011bDE52a462C1") {
        code
        type
      }
    }
  `;

  const result = await execQuery(query);
  expect(result.errors).toBeUndefined();
  expect(result.data.account.code).toMatch(/^0x606060405236156100d55763ffffffff/);
  expect(result.data.account.type).toBe('CONTRACT');
});
