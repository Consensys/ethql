import { EthqlTransaction } from '../../core/model';
import { testGraphql } from '../utils';

const { execQuery } = testGraphql();

test('block->transactionsRoles: error when an invalid from address is specified', async () => {
  const query = `
    {
      block(number: 5755715) {
        transactionsRoles(from: "0x1234") {
          hash
          from {
            address
          }
          to {
            address
          }
        }
      }
    }
  `;

  const result = await execQuery(query);
  expect(result.errors).toHaveLength(1);
  expect(result.errors[0].message).toMatch(/^Expected type Address/);
});

test('block->transactionsRoles: from address only, no matching transactions', async () => {
  const query = `
    {
      block(number: 5755715) {
        transactionsRoles(from: "0xE99DDae9181957E91b457E4c79A1B577E55a5742") {
          hash
          from {
            address
          }
          to {
            address
          }
        }
      }
    }
  `;

  const expected = { data: { block: { transactionsRoles: [] } } };
  const result = await execQuery(query);
  expect(result).toEqual(expected);
});

test('block->transactionsRoles: from address only, matching transactions returned', async () => {
  const query = `
    {
      block(number: 5755715) {
        transactionsRoles(from: "0xCcF1D27AfE45BA5F8c15265199E5b635AF4cb889") {
          hash
          from {
            address
          }
          to {
            address
          }
        }
      }
    }
  `;

  const expected = {
    data: {
      block: {
        transactionsRoles: [
          {
            hash: '0xb112efc908b879b72e167261a8456bc658f922c6c5914540675de657cbf106ca',
            from: {
              address: '0xCcF1D27AfE45BA5F8c15265199E5b635AF4cb889',
            },
            to: {
              address: '0xA4eA687A2A7F29cF2dc66B39c68e4411C0D00C49',
            },
          },
        ],
      },
    },
  };
  const result = await execQuery(query);
  expect(result).toEqual(expected);
});

test('block->transactionsRoles: error when an invalid to address is specified', async () => {
  const query = `
    {
      block(number: 5755715) {
        transactionsRoles(to: "0x1234") {
          hash
          from {
            address
          }
          to {
            address
          }
        }
      }
    }
  `;

  const result = await execQuery(query);
  expect(result.errors).toHaveLength(1);
  expect(result.errors[0].message).toMatch(/^Expected type Address/);
});

test('block->transactionsRoles: to address only, no matching transactions', async () => {
  const query = `
    {
      block(number: 5755715) {
        transactionsRoles(to: "0xCcF1D27AfE45BA5F8c15265199E5b635AF4cb889") {
          hash
          from {
            address
          }
          to {
            address
          }
        }
      }
    }
  `;

  const expected = { data: { block: { transactionsRoles: [] } } };
  const result = await execQuery(query);
  expect(result).toEqual(expected);
});

test('block->transactionsRoles: to address only, matching transactions returned', async () => {
  const query = `
    {
      block(number: 5755715) {
        transactionsRoles(to: "0xA4eA687A2A7F29cF2dc66B39c68e4411C0D00C49") {
          hash
          from {
            address
          }
          to {
            address
          }
        }
      }
    }
  `;

  const expected = {
    data: {
      block: {
        transactionsRoles: [
          {
            hash: '0xb112efc908b879b72e167261a8456bc658f922c6c5914540675de657cbf106ca',
            from: {
              address: '0xCcF1D27AfE45BA5F8c15265199E5b635AF4cb889',
            },
            to: {
              address: '0xA4eA687A2A7F29cF2dc66B39c68e4411C0D00C49',
            },
          },
        ],
      },
    },
  };
  const result = await execQuery(query);
  expect(result).toEqual(expected);
});

test('block->transactionsRoles: error when neither to address or from address are provided', async () => {
  const query = `
    {
      block(number: 5755715) {
        transactionsRoles(from: "", to: "") {
          hash
          from {
            address
          }
          to {
            address
          }
        }
      }
    }
  `;

  const result = await execQuery(query);
  expect(result.errors).toHaveLength(2);
  expect(result.errors[0].message).toMatch(/^Expected type Address/);
  expect(result.errors[1].message).toMatch(/^Expected type Address/);
});

test('block->transactionsRoles: error when valid from address and invalid to address is provided', async () => {
  const query = `
    {
      block(number: 5755715) {
        transactionsRoles(from: "0x364904669aA5eDd0d5BF8e64E63442152344d5CA", to: "0x1234") {
          hash
          from {
            address
          }
          to {
            address
          }
        }
      }
    }
  `;

  const result = await execQuery(query);
  expect(result.errors).toHaveLength(1);
  expect(result.errors[0].message).toMatch(/^Expected type Address/);
});

test('block->transactionsRoles: both from and to addresses, no matching transactions', async () => {
  const query = `
    {
      block(number: 5755715) {
        transactionsRoles(from: "0xA4eA687A2A7F29cF2dc66B39c68e4411C0D00C49", to: "0xCcF1D27AfE45BA5F8c15265199E5b635AF4cb889") {
          hash
          from {
            address
          }
          to {
            address
          }
        }
      }
    }
  `;

  const expected = { data: { block: { transactionsRoles: [] } } };
  const result = await execQuery(query);
  expect(result).toEqual(expected);
});

test('block->transactionsRoles: both from and to addresses, matching transactions returned', async () => {
  const fromAddr = '0x3f5CE5FBFe3E9af3971dD833D26bA9b5C936f0bE';
  const toAddr = '0x4156D3342D5c385a87D264F90653733592000581';

  const txBySender = await execQuery(`{
    block(number: 5450945) {
      transactionsRoles(from: "${fromAddr}") {
        hash
        from {
          address
        }
        to {
          address
        }
      }
    }
  }`);

  expect(txBySender.errors).toBeUndefined();
  let txs = txBySender.data.block.transactionsRoles as EthqlTransaction[];
  expect(txs.every(tx => tx.from.address === fromAddr)).toBeTruthy();
  expect(txs.filter(tx => tx.from.address === fromAddr && tx.to.address === toAddr)).toHaveLength(1);

  const txIntersect = await execQuery(`{
    block(number: 5450945) {
      transactionsRoles(from: "${fromAddr}", to: "${toAddr}") {
        hash
        from {
          address
        }
        to {
          address
        }
      }
    }
  }`);

  expect(txIntersect.errors).toBeUndefined();
  txs = txIntersect.data.block.transactionsRoles as EthqlTransaction[];
  expect(txs).toHaveLength(1);
});
