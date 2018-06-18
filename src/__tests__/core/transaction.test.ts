import { graphql, GraphQLSchema } from 'graphql';
import { testSchema } from '../utils';

let schema = testSchema();

test('transaction: select transaction by specific hash', async () => {
  const query = `
      {
        transaction(hash: "0xdccbeb289f6630fd76fa2681837422fda9f76449653aa750d4e6b2822cf300fd") {
          nonce
        }
      }
    `;

  const expected = { data: { transaction: { nonce: 10 } } };

  const result = await graphql(schema, query);
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

  const result = await graphql(schema, query);
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

  const result = await graphql(schema, query);
  expect(result.errors).toHaveLength(1);
  expect(result.errors[0].message).toMatch(/^Expected type Hash/);
});

test('transaction: requesting decoded field', async () => {
  const query = `
      {
        transaction(hash: "0xd72b7a9e3461ee34b37da8b9bbc1b58e7bad37702c404400f01631080262a293") {
          nonce
          decoded {
            operation
          }
      }
   }
 `;

 const expected =  {data: { transaction: { decoded:
   { operation: 'transfer' }, nonce: 5125979 } } };

 const result = await graphql(schema, query);
 expect(result).toEqual(expected);
});
