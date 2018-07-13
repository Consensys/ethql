import { testGraphql } from '../utils';

const { execQuery } = testGraphql();

test('transaction: select transaction by specific hash', async () => {
  const query = `
      {
        transaction(hash: "0xdccbeb289f6630fd76fa2681837422fda9f76449653aa750d4e6b2822cf300fd") {
          nonce
        }
      }
    `;

  const expected = { data: { transaction: { nonce: 10 } } };

  const result = await execQuery(query);
  expect(result).toEqual(expected);
});

test('transaction: select block for transaction', async () => {
  const query = `
    {
      transaction(hash: "0xdccbeb289f6630fd76fa2681837422fda9f76449653aa750d4e6b2822cf300fd") {
        block {
          number
        }
      }
    }
  `;
  const expected = { data: { transaction: { block: { number: 5473309 } } } };

  const result = await execQuery(query);
  expect(result).toEqual(expected);
});

test('transaction: select non-existent transaction', async () => {
  const query = `
      {
        transaction(hash: "0xdccbeb289f6630fd76fa2681837422fda9f76449653aa750d4e6b2822cf300f1") {
          nonce
        }
      }
    `;

  const expected = { data: { transaction: null } };

  const result = await execQuery(query);
  expect(result).toEqual(expected);
});

test('transaction: error when malformed hash provided', async () => {
  const query = `
        {
        transaction(hash: "0x1234") {
            nonce
          }
        }
    `;

  const result = await execQuery(query);
  expect(result.errors).toHaveLength(1);
  expect(result.errors[0].message).toMatch(/^Expected type Hash/);
});

test('transaction: status returns "SUCCESS" when transaction was successful', async () => {
  const query = `
  {
    transaction(hash: "0xdccbeb289f6630fd76fa2681837422fda9f76449653aa750d4e6b2822cf300fd") {
      status
    }
  }
  `;

  const expected = {
    data: {
      transaction: {
        status: 'SUCCESS',
      },
    },
  };

  const result = await execQuery(query);
  expect(result).toEqual(expected);
});

test('transaction: status returns "FAILED" when transaction was unsuccessful', async () => {
  const query = `
  {
    transaction(hash: "0x94b07d32c065d16b7807065c6c0c7e32064ba295ff6ff95fe2b484f15580a60f") {
      status
    }
  }
  `;

  const expected = {
    data: {
      transaction: {
        status: 'FAILED',
      },
    },
  };

  const result = await execQuery(query);
  expect(result).toEqual(expected);
});

test('transaction: status returns null when transaction status is undefined', async () => {
  const query = `
  {
    transaction(hash: "0x5c504ed432cb51138bcf09aa5e8a410dd4a1e204ef84bfed1be16dfba1b22060") {
      status
    }
  }
  `;

  const expected = {
    data: {
      transaction: {
        status: null,
      },
    },
  };

  const result = await execQuery(query);
  expect(result).toEqual(expected);
});
