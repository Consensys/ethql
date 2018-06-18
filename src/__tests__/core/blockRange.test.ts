import { testGraphql } from '../utils';

const { execQuery } = testGraphql();

test('blocksRange: select multiple blocks by number range', async () => {
  const query = `
    {
      blocksRange(numberRange: [10, 12]) {
        timestamp
      }
    }
  `;

  const expected = {
    data: { blocksRange: [{ timestamp: '1438270128' }, { timestamp: '1438270136' }, { timestamp: '1438270144' }] },
  };

  const result = await execQuery(query);
  expect(result).toEqual(expected);
});

test('blocksRange: select multiple blocks by hash range', async () => {
  const query = `
    {
      blocksRange(hashRange:
        ["0x685b762b9d37807ab5c534936530afdb3794b79937f3e61e0b832d0e13e6eabf",
         "0x2e3d27de5a29082765794cd721c70fac641e546d683ccdc5d178e0bc2aca040e"]) {
        number
      }
    }
  `;

  const expected = {
    data: { blocksRange: [{ number: 20222 }, { number: 20223 }, { number: 20224 }] },
  };
  const result = await execQuery(query);
  expect(result).toEqual(expected);
});

test('blocksRange: error when both numberRange and hashRange are provided', async () => {
  const query = `
    {
      blocksRange(numberRange: [10, 12],
        hashRange: [
          "0x685b762b9d37807ab5c534936530afdb3794b79937f3e61e0b832d0e13e6eabf",
          "0x2e3d27de5a29082765794cd721c70fac641e546d683ccdc5d178e0bc2aca040e"]) {
        number
      }
    }
  `;

  const result = await execQuery(query);
  expect(result.data.blocksRange).toBeNull();
  expect(result.errors).toHaveLength(1);
  expect(result.errors[0].message).toBe('Only one of blocks or hashes should be provided.');
});

test('blocksRange: error when more than two numbers are provided', async () => {
  const query = `
    {
      blocksRange(numberRange: [10, 12, 14]) {
        timestamp
      }
    }
  `;

  const result = await execQuery(query);
  expect(result.data.blocksRange).toBeNull();
  expect(result.errors).toHaveLength(1);
  expect(result.errors[0].message).toBe('Exactly two elements were expected: the start and end blocks.');
});

test('blocksRange: error when more than two hashes are provided', async () => {
  const query = `
    {
      blocksRange(hashRange: [
        "0x685b762b9d37807ab5c534936530afdb3794b79937f3e61e0b832d0e13e6eab1",
        "0x685b762b9d37807ab5c534936530afdb3794b79937f3e61e0b832d0e13e6eab2",
        "0x685b762b9d37807ab5c534936530afdb3794b79937f3e61e0b832d0e13e6eab3"]) {
        number
      }
    }
  `;

  const result = await execQuery(query);
  expect(result.data.blocksRange).toBeNull();
  expect(result.errors).toHaveLength(1);
  expect(result.errors[0].message).toBe('Exactly two elements were expected: the start and end blocks.');
});

test('blocksRange: error when no input parameters', async () => {
  const query = `
    {
      blocksRange {
        number
      }
    }
  `;
  const result = await execQuery(query);
  expect(result.data.blocksRange).toBeNull();
  expect(result.errors).toHaveLength(1);
  expect(result.errors[0].message).toBe('Expected either a number range or a hash range.');
});

test('blocksRange: error when only one number provided', async () => {
  const query = `
    {
      blocksRange(numberRange: [13232]) {
        timestamp
      }
    }
  `;
  const result = await execQuery(query);
  expect(result.data.blocksRange).toBeNull();
  expect(result.errors).toHaveLength(1);
  expect(result.errors[0].message).toBe('Exactly two elements were expected: the start and end blocks.');
});

test('blocksRange: error when only one hash provided', async () => {
  const query = `
    {
      blocksRange(hashRange: ["0x685b762b9d37807ab5c534936530afdb3794b79937f3e61e0b832d0e13e6eabf"]) {
        timestamp
      }
    }
  `;

  const result = await execQuery(query);
  expect(result.data.blocksRange).toBeNull();
  expect(result.errors).toHaveLength(1);
  expect(result.errors[0].message).toBe('Exactly two elements were expected: the start and end blocks.');
});

test('blocksRange: error when negative number provided', async () => {
  const query = `
    {
      blocksRange(numberRange: [-1, 122]) {
        timestamp
      }
    }
  `;

  const result = await execQuery(query);
  expect(result.errors).toHaveLength(1);
  expect(result.errors[0].message).toBe('Expected type BlockNumber, found -1.');
});

test('blocksRange: error when start number is larger than end number', async () => {
  const query = `
    {
      blocksRange(numberRange: [122, 2]) {
        timestamp
      }
    }
  `;

  const result = await execQuery(query);
  expect(result.data.blocksRange).toBeNull();
  expect(result.errors).toHaveLength(1);
  expect(result.errors[0].message).toBe('Start block in the range must be prior to the end block.');
});

test('blocksRange: error when block number of start hash is larger than end number', async () => {
  const query = `
    {
      blocksRange(hashRange: [
        "0x2e3d27de5a29082765794cd721c70fac641e546d683ccdc5d178e0bc2aca040e",
        "0x685b762b9d37807ab5c534936530afdb3794b79937f3e61e0b832d0e13e6eabf"
      ]) {
        timestamp
      }
    }
  `;

  const result = await execQuery(query);
  expect(result.data.blocksRange).toBeNull();
  expect(result.errors).toHaveLength(1);
  expect(result.errors[0].message).toBe('Start block in the range must be prior to the end block.');
});

test('blocksRange: error due to nonexistent hash', async () => {
  const query = `
    {
      blocksRange(hashRange: [
        "0x1e3d27de5a29082765794cd721c70fac641e546d683ccdc5d178e0bc2aca040e",
        "0x685b762b9d37807ab5c534936530afdb3794b79937f3e61e0b832d0e13e6eabf"
      ]) {
        timestamp
      }
    }
  `;

  const result = await execQuery(query);
  expect(result.data.blocksRange).toBeNull();
  expect(result.errors).toHaveLength(1);
  expect(result.errors[0].message).toBe('Could not resolve the block associated with one or all hashes.');
});

test('blocksRange: same block number provided twice returns one block', async () => {
  const query = `
    {
      blocksRange(numberRange: [10, 10]) {
        timestamp
      }
    }
  `;

  const expected = {
    data: { blocksRange: [{ timestamp: '1438270128' }] },
  };

  const result = await execQuery(query);
  expect(result).toEqual(expected);
});

test('blocksRange: same block hash provided twice returns one block', async () => {
  const query = `
    {
      blocksRange(hashRange:
        ["0x685b762b9d37807ab5c534936530afdb3794b79937f3e61e0b832d0e13e6eabf",
         "0x685b762b9d37807ab5c534936530afdb3794b79937f3e61e0b832d0e13e6eabf"]) {
        number
      }
    }
  `;

  const expected = { data: { blocksRange: [{ number: 20222 }] } };

  const result = await execQuery(query);
  expect(result).toEqual(expected);
});
