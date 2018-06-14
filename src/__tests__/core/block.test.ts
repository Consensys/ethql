import { testGraphql } from '../utils';

const { execQuery } = testGraphql();

test('block: select single block by number', async () => {
  const query = `
    {
      block(number: 12345) {
        hash
      }
    }
  `;

  const expected = { data: { block: { hash: '0x767c2bfb3bdee3f78676c1285cd757bcd5d8c272cef2eb30d9733800a78c0b6d' } } };
  const result = await execQuery(query);
  expect(result).toEqual(expected);
});

test('block: select single transaction from block by index', async () => {
  const query = `
  {
    block(number: 5771878) {
      difficulty
      transactionAt(index: 22) {
        hash
        nonce
      }
    }
  }`;

  const expected = {
    data: {
      block: {
        difficulty: 3351918027816898,
        transactionAt: { hash: '0xb0804426b4c800f962416f0e7155d9c6be007e95d0af9820bd6cec8d95efdfd5', nonce: 156806 },
      },
    },
  };
  const result = await execQuery(query);
  expect(result).toEqual(expected);
});

test('block: null response when selecting transaction by negative index', async () => {
  const query = `
  {
    block(number: 5771878) {
      difficulty
      transactionAt(index: -1) {
        hash
        nonce
      }
    }
  }`;

  const expected = { data: { block: { difficulty: 3351918027816898, transactionAt: null } } };
  const result = await execQuery(query);
  expect(result).toEqual(expected);
});

test('block: null response when selecting transaction by an index that does not exist in block', async () => {
  const query = `
  {
    block(number: 5771878) {
      difficulty
      transactionAt(index: 140) {
        hash
        nonce
      }
    }
  }`;

  const expected = { data: { block: { difficulty: 3351918027816898, transactionAt: null } } };
  const result = await execQuery(query);
  expect(result).toEqual(expected);
});

test('block: select single block by hash', async () => {
  const query = `
    {
      block(hash: "0x4b3c1d7e65a507b62734feca1ee9f27a5379e318bd52ae62de7ba67dbeac66a3")   {
        number
      }
    }
  `;

  const expected = { data: { block: { number: 12344 } } };
  const result = await execQuery(query);
  expect(result).toEqual(expected);
});

test('block: error when selecting block by invalid hash', async () => {
  const query = `
    {
      block(hash: "0x1234")   {
        number
      }
    }
  `;

  const result = await execQuery(query);
  expect(result.errors).toHaveLength(1);
  expect(result.errors[0].message).toMatch(/^Expected type Hash/);
});

test('block: all scalar fields successfully returned', async () => {
  const query = `
    {
      block(hash: "0x4b3c1d7e65a507b62734feca1ee9f27a5379e318bd52ae62de7ba67dbeac66a3") {
        number
        difficulty
        extraData
        gasLimit
        gasUsed
        hash
        mixHash
        nonce
        receiptsRoot
        stateRoot
        transactionsRoot
        timestamp
        totalDifficulty
      }
    }
  `;

  const expected = {
    data: {
      block: {
        number: 12344,
        difficulty: 735153649021,
        extraData: '0x476574682f76312e302e302d30636463373634372f6c696e75782f676f312e34',
        gasLimit: 5000,
        gasUsed: 0,
        hash: '0x4b3c1d7e65a507b62734feca1ee9f27a5379e318bd52ae62de7ba67dbeac66a3',
        mixHash: '0xa479f6fc3188eccaa1e1af9c63078a8f09f66a45a8c11d96f92e110ab442b49d',
        nonce: '0x5c3a45c45e16729d',
        receiptsRoot: '0x56e81f171bcc55a6ff8345e692c0f86e5b48e01b996cadc001622fb5e363b421',
        stateRoot: '0x262da2fca20d165b195dbf2858d983c90d1d1f7f376da838b704e0632dd28174',
        transactionsRoot: '0x56e81f171bcc55a6ff8345e692c0f86e5b48e01b996cadc001622fb5e363b421',
        timestamp: '1438367018',
        totalDifficulty: 3861404974593840,
      },
    },
  };

  const result = await execQuery(query);
  expect(result).toEqual(expected);
});

test('block->transactionsInvolving: error when no participants are provided', async () => {
  const query = `
    {
      block(number:5755715) {
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
      block(number:5755715) {
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

test.skip('block->transactionsInvolving: transactions successfully returned', async () => {
  const query = `
    {
      block(number:5755715) {
        transactionsInvolving(participants: ["0xE99DDae9181957E91b457E4c79A1B577E55a5742", "0xe5b9746dfCC2eF1054D47A451A77bb5f390c468d", "0x364904669aA5eDd0d5BF8e64E63442152344d5CA"]) {
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
