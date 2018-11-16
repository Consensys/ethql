import { testGraphql } from '../utils';

const { execQuery } = testGraphql();

test('blocks: error when selecting too many blocks by numbers', async () => {
  const query = `
    {
      blocks(numbers: [1202, 20502, 292, 123, 423, 534, 533, 999, 111, 9, 12]) {
        hash
      }
    }
  `;

  const result = await execQuery(query);
  expect(result.data.blocks).toBeNull();
  expect(result.errors).toHaveLength(1);
  expect(result.errors[0].message).toMatch(/^Too large a multiple selection/);
});

test('blocks: error when selecting too many blocks by hashes', async () => {
  const query = `
    {
      blocks(hashes:
        ["0x2f0e2a7b56ef50dcf8856af8d724566fbe51ecc0ff2ed67c235ca56fc67c0151"
         "0x2f0e2a7b56ef50dcf8856af8d724566fbe51ecc0ff2ed67c235ca56fc67c0152",
         "0x2f0e2a7b56ef50dcf8856af8d724566fbe51ecc0ff2ed67c235ca56fc67c0153",
         "0x2f0e2a7b56ef50dcf8856af8d724566fbe51ecc0ff2ed67c235ca56fc67c0154",
         "0x2f0e2a7b56ef50dcf8856af8d724566fbe51ecc0ff2ed67c235ca56fc67c0155",
         "0x2f0e2a7b56ef50dcf8856af8d724566fbe51ecc0ff2ed67c235ca56fc67c0156",
         "0x2f0e2a7b56ef50dcf8856af8d724566fbe51ecc0ff2ed67c235ca56fc67c0157",
         "0x2f0e2a7b56ef50dcf8856af8d724566fbe51ecc0ff2ed67c235ca56fc67c0158",
         "0x2f0e2a7b56ef50dcf8856af8d724566fbe51ecc0ff2ed67c235ca56fc67c0159",
         "0x2f0e2a7b56ef50dcf8856af8d724566fbe51ecc0ff2ed67c235ca56fc67c0150",
         "0x2f0e2a7b56ef50dcf8856af8d724566fbe51ecc0ff2ed67c235ca56fc67c015a"]) {
        hash
      }
    }
  `;

  const result = await execQuery(query);
  expect(result.data.blocks).toBeNull();
  expect(result.errors).toHaveLength(1);
  expect(result.errors[0].message).toMatch(/^Too large a multiple selection/);
});

test('blockRange: error when selecting too many blocks in range by numbers', async () => {
  const query = `
    {
      blocksRange(numberRange: [1, 12]) {
        hash
      }
    }
  `;

  const result = await execQuery(query);
  expect(result.data.blocksRange).toBeNull();
  expect(result.errors).toHaveLength(1);
  expect(result.errors[0].message).toMatch(/^Too large a multiple selection/);
});

test('blockRange: error when selecting too many blocks in range by hashes', async () => {
  const query = `
    {
      blocksRange(hashRange: [
        "0xd4e56740f876aef8c010b86a40d5f56745a118d0906a34e69aec8c0db1cb8fa3",
        "0x4ff4a38b278ab49f7739d3a4ed4e12714386a9fdf72192f2e8f7da7822f10b4d"
      ]) {
        hash
      }
    }
  `;

  const result = await execQuery(query);
  expect(result.data.blocksRange).toBeNull();
  expect(result.errors).toHaveLength(1);
  expect(result.errors[0].message).toMatch(/^Too large a multiple selection/);
});
