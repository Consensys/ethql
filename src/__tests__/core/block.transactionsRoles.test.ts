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
  const query = `
    {
      block(number: 5755715) {
        transactionsRoles(from: "0xCcF1D27AfE45BA5F8c15265199E5b635AF4cb889", to: "0xA4eA687A2A7F29cF2dc66B39c68e4411C0D00C49") {
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

test('block->transactionsRoles: both from and to addresses, multiple matching transactions returned, matched on to only', async () => {
  const query = `
    {
      block(number: 5812225) {
        transactionsRoles(from: "0xCcF1D27AfE45BA5F8c15265199E5b635AF4cb889", to: "0xfa52274dd61e1643d2205169732f29114bc240b3") {
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
            hash: '0x63f15d479bca31d321071035e6999d44f9a8244513b262c29ed549b3c3ae77e3',
            from: {
              address: '0x7f7bF1f8867F3bC41b2B5C2f3BCc5798bc71b391',
            },
            to: {
              address: '0xFa52274DD61E1643d2205169732f29114BC240b3',
            },
          },
          {
            hash: '0x281ca150bcc5a49d5028a0860ef57a8b84a285e1080a88d3a74d00126a32b6b9',
            from: {
              address: '0xfAEe59A232abc5A86286f089F37615FFE48D0A27',
            },
            to: {
              address: '0xFa52274DD61E1643d2205169732f29114BC240b3',
            },
          },
        ],
      },
    },
  };

  const result = await execQuery(query);
  expect(result).toEqual(expected);
});
