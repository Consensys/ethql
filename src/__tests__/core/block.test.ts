import { graphql } from 'graphql';
import schema from '../../schema';

it('Test single block selected by number', async () => {
  const query = `
    {
      block(number: 12345) {
        hash
      }
    }
  `;

  const expected = { data: { block: { hash: '0x767c2bfb3bdee3f78676c1285cd757bcd5d8c272cef2eb30d9733800a78c0b6d' } } };

  const result = await graphql(schema, query);
  expect(result).toEqual(expected);
});

it('Test single block selected by hash', async () => {
  const query = `
    {
      block(hash: "0x4b3c1d7e65a507b62734feca1ee9f27a5379e318bd52ae62de7ba67dbeac66a3")   {
        number
      }
    }
  `;

  const expected = { data: { block: { number: 12344 } } };

  const result = await graphql(schema, query);
  expect(result).toEqual(expected);
});

it('Test multiple blocks selected by specific numbers', async () => {
  const query = `
    {
      blocks(numbers: [1202, 20502, 292]) {
        hash
      }
    }
  `;

  const expected = {
    data: {
      blocks: [
        { hash: '0x2f0e2a7b56ef50dcf8856af8d724566fbe51ecc0ff2ed67c235ca56fc67c0153' },
        { hash: '0x8f91535cf99c1cc1846fb0be42afc2d4dd5ce4f1988567bfd25e92bbfaea76da' },
        { hash: '0xfeeb6c4b368a1b1e2352a1294d8639c30ae0a80649774b27affafb630c374d4e' },
      ],
    },
  };

  const result = await graphql(schema, query);
  expect(result).toEqual(expected);
});

it('Test multiple blocks selected by specific hashes', async () => {
  const hashes = `["0x624d6c50f4edff05693806953b211050ef3e674ed18b1a1a6e64352086006f9e",
      "0xbfe0f792a89bd44e6c22224a84721edfedb334e521afb365fd397442bc1b2b81",
      "0x0cd6b3ef09f74b86fd8e17122deae11c1016a578797472bee1a3bb138323954b"]`;

  const query = `
    {
      blocks(hashes: ${hashes}) {
        number
      }
    }
  `;

  const expected = { data: { blocks: [{ number: 1234 }, { number: 1235 }, { number: 12342 }] } };

  const result = await graphql(schema, query);
  expect(result).toEqual(expected);
});

it('Test multiple blocks selected by number range', async () => {
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

  const result = await graphql(schema, query);
  expect(result).toEqual(expected);
});

it('Test multiple blocks selected by hash range', async () => {
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

  const result = await graphql(schema, query);
  expect(result).toEqual(expected);
});

/* tslint:disable */
it('Test error due to hash range and number range provided in blocksRange query', async () => {
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

  const result = await graphql(schema, query);
  expect(result.data.blocksRange).toBeNull();
  expect(result.errors).toHaveLength(1);
  expect(result.errors[0].message).toBe('Only one of blocks or hashes should be provided.');
});

// Provide more than two numbers in the range => error.
it('Test error due to more than two numbers provided in blocksRange query', async () => {
  const query = `
    {
      blocksRange(numberRange: [10, 12, 14]) {
        timestamp
      }
    }
  `;

  const result = await graphql(schema, query);
  expect(result.data.blocksRange).toBeNull();
  expect(result.errors).toHaveLength(1);
  expect(result.errors[0].message).toBe('Exactly two elements were expected: the start and end blocks.');
});

// Provide more than two hashes in the range => error.
it('Test error due to more than two hashes provided in blocksRange query', async () => {
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
  const result = await graphql(schema, query);
  expect(result.data.blocksRange).toBeNull();
  expect(result.errors).toHaveLength(1);
  expect(result.errors[0].message).toBe('Exactly two elements were expected: the start and end blocks.');
});

// Provide no numbers or hashes => error.
it('Test error due to neither numbers or hashes provided in blocksRange query', async () => {
  const query = `
    {
      blocksRange {
        number
      }
    }
  `;
  const result = await graphql(schema, query);
  expect(result.data.blocksRange).toBeNull();
  expect(result.errors).toHaveLength(1);
  expect(result.errors[0].message).toBe('Expected either a number range or a hash range.');
});

// Provide 1 number only => error.
it('Test error due to one number only provided in blocksRange query', async () => {
  const query = `
    {
      blocksRange(numberRange: [13232]) {
        timestamp
      }
    }
  `;
  const result = await graphql(schema, query);
  expect(result.data.blocksRange).toBeNull();
  expect(result.errors).toHaveLength(1);
  expect(result.errors[0].message).toBe('Exactly two elements were expected: the start and end blocks.');
});

it('Test error due to one hash only provided in blocksRange query', async () => {
  const query = `
    {
      blocksRange(hashRange: ["0x685b762b9d37807ab5c534936530afdb3794b79937f3e61e0b832d0e13e6eabf"]) {
        timestamp
      }
    }
  `;
  const result = await graphql(schema, query);
  expect(result.data.blocksRange).toBeNull();
  expect(result.errors).toHaveLength(1);
  expect(result.errors[0].message).toBe('Exactly two elements were expected: the start and end blocks.');
});

it('Test error negative block number provided', async () => {
  const query = `
    {
      blocksRange(numberRange: [-1, 122]) {
        timestamp
      }
    }
  `;
  const result = await graphql(schema, query);
  expect(result.errors).toHaveLength(1);
  expect(result.errors[0].message).toBe('Expected type BlockNumber, found -1.');
});

it('Test error due to start number larger than end number provided in blocksRange query', async () => {
  const query = `
    {
      blocksRange(numberRange: [122, 2]) {
        timestamp
      }
    }
  `;
  const result = await graphql(schema, query);
  expect(result.data.blocksRange).toBeNull();
  expect(result.errors).toHaveLength(1);
  expect(result.errors[0].message).toBe('Start block in the range must be prior to the end block.');
});

it('Test error due to start hash whose block number is higher than end hash block number provided in blocksRange query', async () => {
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
  const result = await graphql(schema, query);
  expect(result.data.blocksRange).toBeNull();
  expect(result.errors).toHaveLength(1);
  expect(result.errors[0].message).toBe('Start block in the range must be prior to the end block.');
});

it('Test error due to nonexistent hash provided in blocksRange query', async () => {
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
  const result = await graphql(schema, query);
  expect(result.data.blocksRange).toBeNull();
  expect(result.errors).toHaveLength(1);
  expect(result.errors[0].message).toBe('Could not resolve the block associated with one or all hashes.');
});

// Provide the same block number twice => it should just return one block.
it('Test same block number provided twice in blocksRange returns one block', async () => {
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

  const result = await graphql(schema, query);
  expect(result).toEqual(expected);
});

// Provide the same hash twice => it should just return one block.
it('Test same hash provided twice in blocksRange returns one block', async () => {
  const query = `
    {
      blocksRange(hashRange: ["0x685b762b9d37807ab5c534936530afdb3794b79937f3e61e0b832d0e13e6eabf", "0x685b762b9d37807ab5c534936530afdb3794b79937f3e61e0b832d0e13e6eabf"]) {
        number
      }
    }
  `;

  const expected = { data: { blocksRange: [{ number: 20222 }] } };

  const result = await graphql(schema, query);
  expect(result).toEqual(expected);
});
