import { graphql } from 'graphql';
import { schema } from '../src/schema';

it('Test single block selected by number', async () => {
  const query = `
    {
      block(number: 12345) {
        hash
      }
    }
  `;

  const rootValue = {};
  const context = {};
  const expected = {"data": {"block": {"hash": "0x767c2bfb3bdee3f78676c1285cd757bcd5d8c272cef2eb30d9733800a78c0b6d"}}};

  const result = await graphql(schema, query, rootValue, context);
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

  const rootValue = {};
  const context = {};
  const expected = {"data": {"block": {"number": 12344}}};

  const result = await graphql(schema, query, rootValue, context);
  expect(result).toEqual(expected);
});


it('Test multiple blocks selected by number range', async () => {
  const query = `
    {
      blocks(from: 1234, to: 1235) {
        hash
      }
    }
  `;

  const rootValue = {};
  const context = {};
  const expected = {"data": {"blocks": [{"hash": "0x624d6c50f4edff05693806953b211050ef3e674ed18b1a1a6e64352086006f9e"}, {"hash": "0xbfe0f792a89bd44e6c22224a84721edfedb334e521afb365fd397442bc1b2b81"}]}};

  const result = await graphql(schema, query, rootValue, context);
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

  const rootValue = {};
  const context = {};
  const expected = {"data": {"blocks": [{"hash": "0x2f0e2a7b56ef50dcf8856af8d724566fbe51ecc0ff2ed67c235ca56fc67c0153"}, {"hash": "0x8f91535cf99c1cc1846fb0be42afc2d4dd5ce4f1988567bfd25e92bbfaea76da"}, {"hash": "0xfeeb6c4b368a1b1e2352a1294d8639c30ae0a80649774b27affafb630c374d4e"}]}};

  const result = await graphql(schema, query, rootValue, context);
  expect(result).toEqual(expected);
});


it('Test multiple blocks selected by specific hashes', async () => {
  const query = `
    {
      blocks(hashes: ["0x624d6c50f4edff05693806953b211050ef3e674ed18b1a1a6e64352086006f9e", 
      "0xbfe0f792a89bd44e6c22224a84721edfedb334e521afb365fd397442bc1b2b81", 
      "0x0cd6b3ef09f74b86fd8e17122deae11c1016a578797472bee1a3bb138323954b"]) { 
        number
       }
    }
  `;

  const rootValue = {};
  const context = {};
  const expected = {"data": {"blocks": [{"number": 1234}, {"number": 1235}, {"number": 12342}]}};

  const result = await graphql(schema, query, rootValue, context);
  expect(result).toEqual(expected);
});
