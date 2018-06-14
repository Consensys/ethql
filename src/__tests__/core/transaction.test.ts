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

test('transaction: select non-existent transaction', async () => {
  const query = `
      {
        transaction(hash: "0x0000000000000000000000000000000000000000000000000000000000000001") {
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
