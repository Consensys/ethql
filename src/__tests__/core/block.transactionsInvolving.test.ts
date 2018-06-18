import { testGraphql } from '../utils';

const { execQuery } = testGraphql();

test('block->transactionsInvolving: error when no participants are provided', async () => {
  const query = `
    {
      block(number: 5755715) {
        transactionsInvolving(participants: []) {
          hash
        }
      }
    }
  `;

  const result = await execQuery(query);
  expect(result.data.block.transactionsInvolving).toBeNull();
  expect(result.errors).toHaveLength(1);
  expect(result.errors[0].message).toBe('Expected at least one participant.');
});

test('block->transactionsInvolving: error when invalid participant hash provided', async () => {
  const query = `
    {
      block(number: 5755715) {
        transactionsInvolving(participants: ["0x5b31f76dae4485f0dc0e7d1577c2c1a33cd0fd20", "0x1234", "0xE99DDae9181957E91b457E4c79A1B577E55a5742"]) {
          hash
        }
      }
    }
  `;

  const result = await execQuery(query);
  expect(result.errors).toHaveLength(1);
  expect(result.errors[0].message).toMatch(/^Expected type Address/);
});

test('block->transactionsInvolving: transactions successfully returned', async () => {
  const query = `
    {
      block(number: 5755715) {
        transactionsInvolving(participants: [
          "0xE99DDae9181957E91b457E4c79A1B577E55a5742",
          "0xe5b9746dfCC2eF1054D47A451A77bb5f390c468d",
          "0x364904669aA5eDd0d5BF8e64E63442152344d5CA"]) {
          hash
        }
      }
    }
  `;

  const expected = {
    data: {
      block: {
        transactionsInvolving: [
          {
            hash: '0x6f2bc776c7b38fed860c0368bdb9e13497712315323733f5a5132e3773357f7f',
          },
          {
            hash: '0x0b1e4e94c912c6e43f3c4443cc81c0ab1e901ccc706021e6948cdf9bbf33d4ca',
          },
          {
            hash: '0x1dd3a56879900c0fe8e3f25bb2198029c36f0022b6ec4b31426c85267ce27bf6',
          },
          {
            hash: '0x4faab41fe581ad8cd4b00df17fc9e703f6550d39f63999e1af911d84ce54c55b',
          },
        ],
      },
    },
  };

  const result = await execQuery(query);
  expect(result).toEqual(expected);
});

test('block->transactionsInvolving: match non-checksummed addresses', async () => {
  const query = `
    {
      block(number: 5755715) {
        transactionsInvolving(participants: [
          "0xe99ddae9181957e91b457e4c79a1b577e55a5742"]) {
          hash
        }
      }
    }
  `;

  const expected = {
    data: {
      block: {
        transactionsInvolving: [
          {
            hash: '0x4faab41fe581ad8cd4b00df17fc9e703f6550d39f63999e1af911d84ce54c55b',
          },
        ],
      },
    },
  };

  const result = await execQuery(query);
  expect(result).toEqual(expected);
});

test('block->transactionsInvolving: block with contract creations (null to address) does not fail', async () => {
  const query = `
    {
      block(number: 5000000) {
        transactionsInvolving(participants: [
          "0x52bc44d5378309ee2abf1539bf71de1b7d7be3b5",
          "0x49bca73765cadce6b80dd17d2a957d3d55d53836",
          "0xbaa705866f77af9194a8a91b8104438b20272958"]) {
          hash
        }
      }
    }
  `;

  const expected = {
    data: {
      block: {
        transactionsInvolving: [
          {
            hash: '0x7cc930cef131502bb78c13012caf0d99117892601b81fb95958aac98191fe6fb',
          },
          {
            hash: '0xc18604dd4c911148f43900ca26480527022132b0fe821a03a72ec6b69d761d1c',
          },
          {
            hash: '0x218651412101c68079b2e1a91e9b9c69c4269107a00c88c4c5cee249af7f2d7e',
          },
        ],
      },
    },
  };

  const result = await execQuery(query);
  expect(result.errors).toBeUndefined();
  expect(result).toEqual(expected);
});
