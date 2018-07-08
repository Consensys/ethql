import { testGraphql } from '../utils';

const { execQuery } = testGraphql({ jsonrpc: 'https://ropsten.infura.io' });

test('account->storage: retrieve basic value from storage', async () => {
  const query = `
  {
    account(address: "0x171AEEfFa86Fbfd8c9d25A235f1dDBB03A635742") {
      storage {
        value(at: 0)
      }
    }
  }
      `;

  const expected = {
    data: {
      account: {
        storage: {
          value: '0x000000000000000000000000000000000000000000000000000000000000029a',
        },
      },
    },
  };

  const result = await execQuery(query);
  expect(result).toEqual(expected);
});

test('account->storage: retrieve fixed array storage', async () => {
  const query = `
  {
    account(address: "0x171AEEfFa86Fbfd8c9d25A235f1dDBB03A635742") {
      storage {
        solidityFixedArray(at: 1) {
          value(at: 4)
        }
      }
    }
  }
  `;

  const expected = {
    data: {
      account: {
        storage: {
          solidityFixedArray: {
            value: '0x000000000000000000000000779bdd255c2d5cadc3f318f616fc1018c7f2501e',
          },
        },
      },
    },
  };

  const result = await execQuery(query);
  expect(result).toEqual(expected);
});

test('account->storage: retrieve dynamic array storage', async () => {
  const query = `
    {
      account(address: "0x171AEEfFa86Fbfd8c9d25A235f1dDBB03A635742") {
        storage {
          solidityDynamicArray(at: 6) {
            value(at: 150)
          }
        }
      }
    }
    `;

  const expected = {
    data: {
      account: {
        storage: {
          solidityDynamicArray: {
            value: '0x6920616d20706f736974696f6e20313530000000000000000000000000000022',
          },
        },
      },
    },
  };

  const result = await execQuery(query);
  expect(result).toEqual(expected);
});

test('account->storage: retrieve map storage with string key', async () => {
  const query = `
    {
      account(address: "0x171AEEfFa86Fbfd8c9d25A235f1dDBB03A635742") {
        storage {
          solidityMap(at: 7, keyType: "string") {
            value(at: "hello")
          }
        }
      }
    }
    `;

  const expected = {
    data: {
      account: {
        storage: {
          solidityMap: {
            value: '0x776f726c6400000000000000000000000000000000000000000000000000000a',
          },
        },
      },
    },
  };

  const result = await execQuery(query);
  expect(result).toEqual(expected);
});

test('account->storage: retrieve map storage with numerical key', async () => {
  const query = `
    {
      account(address: "0x171AEEfFa86Fbfd8c9d25A235f1dDBB03A635742") {
        storage {
          solidityMap(at: 8, keyType: "number") {
            value(at: "1234")
          }
        }
      }
    }
    `;

  const expected = {
    data: {
      account: {
        storage: {
          solidityMap: {
            value: '0x00000000000000000000000000000000000000000000000000000000000010e1',
          },
        },
      },
    },
  };

  const result = await execQuery(query);
  expect(result).toEqual(expected);
});

test('account->storage: retrieve nested map storage inside a fixed list', async () => {
  const query = `
    {
      account(address: "0x171AEEfFa86Fbfd8c9d25A235f1dDBB03A635742") {
        storage {
          solidityFixedArray(at: 9) {
            solidityMap(at: 11, keyType: "string") {
              value(at: "marco")
            }
          }
        }
      }
    }
    `;

  const expected = {
    data: {
      account: {
        storage: {
          solidityFixedArray: {
            solidityMap: {
              value: '0x0000000000000000000000000000000000000000000000000000000000001b62',
            },
          },
        },
      },
    },
  };

  const result = await execQuery(query);
  expect(result).toEqual(expected);
});

test('account->storage: retrieve nested dynamic list storage inside a map', async () => {
  const query = `
    {
      account(address: "0x171AEEfFa86Fbfd8c9d25A235f1dDBB03A635742") {
        storage {
          solidityMap(at: 29, keyType: "address") {
            solidityDynamicArray(at: "0x874B54A8bD152966d63F706BAE1FfeB0411921E5") {
              value(at: 10)
            }
          }
        }
      }
    }
    `;

  const expected = {
    data: {
      account: {
        storage: {
          solidityMap: {
            solidityDynamicArray: {
              value: '0x6920616d206e6f7420706f736974696f6e20313530000000000000000000002a',
            },
          },
        },
      },
    },
  };

  const result = await execQuery(query);
  expect(result).toEqual(expected);
});

test('account->storage: retrieve nested dynamic list storage inside a fixed list', async () => {
  const query = `
    {
      account(address: "0x171AEEfFa86Fbfd8c9d25A235f1dDBB03A635742") {
        storage {
          solidityFixedArray(at: 30) {
            solidityDynamicArray(at: 40) {
              value(at: 0)
            }
          }
        }
      }
    }
    `;

  const expected = {
    data: {
      account: {
        storage: {
          solidityFixedArray: {
            solidityDynamicArray: {
              value: '0x74686520656e640000000000000000000000000000000000000000000000000e',
            },
          },
        },
      },
    },
  };

  const result = await execQuery(query);
  expect(result).toEqual(expected);
});
