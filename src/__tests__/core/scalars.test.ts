import { testGraphql } from '../utils';

const { execQuery, prepareContext } = testGraphql();

test('Long: parseLiteral', async () => {
  const query = `
    {
      blockOffset(number: 12345, offset: 13212) {
        number
      }
    }
  `;

  const expected = { data: { blockOffset: { number: 25557 } } };
  const result = await execQuery(query);
  expect(result).toEqual(expected);
});

test('Long: parseValue', async () => {
  const query = `
    query($long: BlockNumber) {
      blockOffset(number: $long, offset: 13212) {
        number
      }
    }
  `;

  const expected = { data: { blockOffset: { number: 25557 } } };
  const vars = { long: 12345 };
  const result = await execQuery(query, prepareContext(), vars);
  expect(result).toEqual(expected);
});

test('BlockNumber: parseLiteral', async () => {
  const query = `
    {
      block(number: 5958397) {
          number
        }
      }
  `;

  const expected = { data: { block: { number: 5958397 } } };
  const result = await execQuery(query);
  expect(result).toEqual(expected);
});

test('BlockNumber: parseValue', async () => {
  const query = `
    query($number: BlockNumber) {
      block(number: $number) {
          number
        }
      }
  `;

  const expected = { data: { block: { number: 5958397 } } };
  const vars = { number: 5958397 };
  const result = await execQuery(query, prepareContext(), vars);
  expect(result).toEqual(expected);
});

test('Address: parseLiteral', async () => {
  const query = `
    {
      account(address: "0x0000000000000000000000000000000000000001") {
        address
      }
    }
  `;

  const expected = { data: { account: { address: '0x0000000000000000000000000000000000000001' } } };
  const result = await execQuery(query);
  expect(result).toEqual(expected);
});

test('Address: parseValue', async () => {
  const query = `
    query($address: Address!) {
      account(address: $address) {
        address
      }
    }
  `;

  const expected = { data: { account: { address: '0x0000000000000000000000000000000000000001' } } };
  const vars = { address: '0x0000000000000000000000000000000000000001' };
  const result = await execQuery(query, prepareContext(), vars);
  expect(result).toEqual(expected);
});

test('Bytes32: parseLiteral', async () => {
  const query = `
    {
      block(hash: "0x4058f2f11f7399056d64e27e17de83ce564ce8f8dc6190f87473c8d456f45087") {
        number
      }
    }
  `;

  const expected = { data: { block: { number: 5958397 } } };
  const result = await execQuery(query);
  expect(result).toEqual(expected);
});

test('Bytes32: parseValue', async () => {
  const query = `
    query($hash: Bytes32) {
      block(hash: $hash) {
        number
      }
    }
  `;

  const expected = { data: { block: { number: 5958397 } } };
  const vars = { hash: '0x4058f2f11f7399056d64e27e17de83ce564ce8f8dc6190f87473c8d456f45087' };
  const result = await execQuery(query, prepareContext(), vars);
  expect(result).toEqual(expected);
});
