import { testGraphql } from '../utils';

const { execQuery } = testGraphql();

test('block: select single block by number with positive offset', async () => {
  const query = `
    {
      blockOffset(offset: {number: 12345, offset: 13212}) {
        number
        hash
      }
    }
  `;

  const expected = {
    data: {
      blockOffset: { hash: '0xdfe970e96dde5d1f8da2da2ef0c985e20c7a0d36ca6ccfd5a82164529db75e85', number: 25557 },
    },
  };
  const result = await execQuery(query);
  expect(result).toEqual(expected);
});

test('block: select single block by number with zero offset', async () => {
  const query = `
    {
      blockOffset(offset: {number: 12345, offset: 0}) {
        number
        hash
      }
    }
  `;

  const expected = {
    data: {
      blockOffset: { hash: '0x767c2bfb3bdee3f78676c1285cd757bcd5d8c272cef2eb30d9733800a78c0b6d', number: 12345 },
    },
  };
  const result = await execQuery(query);
  expect(result).toEqual(expected);
});

test('block: select single block by number with negative offset', async () => {
  const query = `
      {
        blockOffset(offset: {number: 12345, offset: -5323}) {
            number
            hash
        }
      }
    `;

  const expected = {
    data: { blockOffset: { hash: '0xce3b85647998ea565fd5a51b30052c5fc5b22c47083d4d5cef30a4647503eecc', number: 7022 } },
  };
  const result = await execQuery(query);
  expect(result).toEqual(expected);
});

test('block: select single block by hash with positive offset', async () => {
  const query = `
      {
        blockOffset(offset: {hash: "0x767c2bfb3bdee3f78676c1285cd757bcd5d8c272cef2eb30d9733800a78c0b6d", offset: 12312}) {
          number
          hash
        }
      }
    `;

  const expected = {
    data: {
      blockOffset: { hash: '0xec2d531b7f47f16aff1c995e0a4905093cdc8dcae40d1271d63fbbdb5009c214', number: 24657 },
    },
  };
  const result = await execQuery(query);
  expect(result).toEqual(expected);
});

test('block: select single block by hash with zero offset', async () => {
  const query = `
      {
        blockOffset(offset: {hash: "0xec2d531b7f47f16aff1c995e0a4905093cdc8dcae40d1271d63fbbdb5009c214", offset: 0}) {
            number
          hash
        }
      }
    `;

  const expected = {
    data: {
      blockOffset: { hash: '0xec2d531b7f47f16aff1c995e0a4905093cdc8dcae40d1271d63fbbdb5009c214', number: 24657 },
    },
  };
  const result = await execQuery(query);
  expect(result).toEqual(expected);
});

test('block: select single block by hash with negative offset', async () => {
  const query = `
      {
        blockOffset(offset: {hash: "0x767c2bfb3bdee3f78676c1285cd757bcd5d8c272cef2eb30d9733800a78c0b6d", offset: -1232}) {
            number
          hash
        }
      }
    `;

  const expected = {
    data: {
      blockOffset: { hash: '0x439a6929bf0ce89c00a3890b1e7de0e5c378bbbb49e901be183f82b82dea1359', number: 11113 },
    },
  };
  const result = await execQuery(query);
  expect(result).toEqual(expected);
});

test('block: error when hash and number provided', async () => {
  const query = `
        {
            blockOffset(offset: {hash: "0x767c2bfb3bdee3f78676c1285cd757bcd5d8c272cef2eb30d9733800a78c0b6d", number: 12345, offset: 12312}) {
                number
            hash
          }
        }
      `;

  const result = await execQuery(query);
  expect(result.errors).toHaveLength(1);
  expect(result.errors[0].message).toMatch('Only one of number or hash argument should be provided.');
});

test('block: error when neither hash nor number provided', async () => {
  const query = `
        {
            blockOffset(offset: {offset: 1}) {
                number
            hash
          }
        }
      `;

  const result = await execQuery(query);
  expect(result.errors).toHaveLength(1);
  expect(result.errors[0].message).toMatch('Expected either number or hash argument and offset argument.');
});

test('block: error when offset not provided', async () => {
  const query = `
          {
            blockOffset(offset: { hash: "0x767c2bfb3bdee3f78676c1285cd757bcd5d8c272cef2eb30d9733800a78c0b6d" }) {
              number
              hash
            }
          }
        `;

  const result = await execQuery(query);
  expect(result.errors).toHaveLength(1);
  expect(result.errors[0].message).toMatch('Expected either number or hash argument and offset argument.');
});

test('block: error when block provided does not exist', async () => {
  const query = `
        {
          blockOffset(offset: { hash: "0x1234", offset: 2 }) {
            number
            hash
          }
        }
      `;

  const result = await execQuery(query);
  expect(result.errors).toHaveLength(1);
  expect(result.errors[0].message).toMatch(/^Expected type Hash/);
});
