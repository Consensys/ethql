import { testGraphql } from '../utils';

const { execQuery } = testGraphql({ configOverride: { jsonrpc: 'https://ropsten.infura.io' } });
const contractAddress = '"0x9c72Eda6de2F67F3B3DbcA3788Aa307AEF1e0Cef"';

/*
Contract used for testing (creates a variety of storage types covering all the required types and then assigns them values):

pragma solidity ^0.4.24;

contract tests {
    uint256 pos0;
    address[5] pos1;
    string[] pos6;
    mapping(string => string) pos7;
    mapping(uint256 => uint256) pos8;
    mapping(string => uint256)[20] pos9;
    mapping(address => string[]) pos29;
    string[][80] pos30;

    constructor () public {
        pos0 = 666;
        pos1[4] = 0x779bDD255C2d5caDC3f318f616fc1018c7F2501E;
        pos6.length = 300;
        pos6[150] = "i am position 150";
        pos7["hello"] = "world";
        pos8[1234] = 4321;
        pos9[11]["marco"] = 7010;
        pos29[0x874B54A8bD152966d63F706BAE1FfeB0411921E5].length = 20;
        pos29[0x874B54A8bD152966d63F706BAE1FfeB0411921E5][10] = "i am not position 150";
        pos30[40].push("the end");
        pos30[40].push("of the beginning");
    }
}
*/

test('account->storage: returns null when given a null address', async () => {
  const query = `
    {
      transaction(hash: "0x4ed6c2d00498d9ed88583bfd49469a583bbe33cd47e257756c17b23f2ee7798c") {
        to {
          storage {
            value(at: 0)
          }
        }
      }
    }`;

  const expected = {
    data: {
      transaction: {
        to: {
          storage: null,
        },
      },
    },
  };

  const result = await execQuery(query);
  expect(result).toEqual(expected);
});

test('account->storage: retrieve basic value from storage', async () => {
  const query = `
    {
      account(address: ${contractAddress}) {
        storage {
          value(at: 0)
        }
      }
    }`;

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
    account(address: ${contractAddress}) {
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
      account(address: ${contractAddress}) {
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
      account(address: ${contractAddress}) {
        storage {
          solidityMap(at: 7, keyType: string) {
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
      account(address: ${contractAddress}) {
        storage {
          solidityMap(at: 8, keyType: number) {
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
      account(address: ${contractAddress}) {
        storage {
          solidityFixedArray(at: 9) {
            solidityMap(at: 11, keyType: string) {
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
      account(address: ${contractAddress}) {
        storage {
          solidityMap(at: 29, keyType: address) {
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
      account(address: ${contractAddress}) {
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

test('account->storage: retrieve multiple value calls', async () => {
  const query = `
    {
      account(address: ${contractAddress}) {
        storage {
          solidityFixedArray(at: 30) {
            solidityDynamicArray(at: 40) {
              val1: value(at: 0)
              val2: value(at: 1)
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
              val1: '0x74686520656e640000000000000000000000000000000000000000000000000e',
              val2: '0x6f662074686520626567696e6e696e6700000000000000000000000000000020',
            },
          },
        },
      },
    },
  };

  const result = await execQuery(query);
  expect(result).toEqual(expected);
});
