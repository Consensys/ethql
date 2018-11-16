import { testGraphql } from '../utils';

const { execQuery } = testGraphql();

describe('transactionFilter on Block->transactions', async () => {
  test('withInput: true value, returns only transactions with input data', async () => {
    const query = `
      {
        block(number: 5783495) {
          transactions(filter: { withInput: true }) {
            hash
            inputData
          }
        }
      }
    `;

    const result = await execQuery(query);
    expect(result.data.block.transactions).toHaveLength(2);
    for (let tx of result.data.block.transactions) {
      expect(tx.inputData).toMatch(/0x.+/);
    }
  });

  test('withInput: false value, returns only transactions without input data', async () => {
    const query = `
      {
        block(number: 5783495) {
          transactions(filter: { withInput: false }) {
            hash
            inputData
          }
        }
      }
    `;

    const expected = {
      data: {
        block: {
          transactions: [
            {
              hash: '0x238dff8a480c6784455115224b6eafa8a8e5f8830a61d20aa241ed5fea326a9b',
              inputData: null,
            },
            {
              hash: '0x4102ad582cc7142372e0c0147c876ad679a7bb9d84c1abe4ab55b8190b6a4487',
              inputData: null,
            },
            {
              hash: '0xe4da0f1943179898a5ca3f67615a9aab00697b31acdabdcf8e2539d7884ed852',
              inputData: null,
            },
          ],
        },
      },
    };
    const result = await execQuery(query);
    expect(result).toEqual(expected);
  });

  test('withInput: true value, no matching transactions', async () => {
    const query = `
      {
        block(number: 63515) {
          transactions(filter: { withInput: true }) {
            hash
          }
        }
      }
    `;

    const expected = { data: { block: { transactions: [] } } };
    const result = await execQuery(query);
    expect(result).toEqual(expected);
  });

  test('withInput: invalid query', async () => {
    const query = `
      {
        block(number: 63515) {
          transactions (filter: yes) {
            hash
          }
        }
      }
    `;

    const result = await execQuery(query);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].message).toMatch(/^Expected type TransactionFilter/);
  });

  test('contractCreation: true value, returns only transactions with contract creations', async () => {
    const query = `
      {
        block(number: 4180981) {
          transactions(filter: { contractCreation: true }) {
            hash
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
          transactions: [
            {
              hash: '0xab8565481d5edcd162da315bf194b349451b37efbe10e068c601a8cfa84728ca',
              to: {
                address: null,
              },
            },
          ],
        },
      },
    };
    const result = await execQuery(query);
    expect(result).toEqual(expected);
  });

  test('contractCreation: false value, returns only transactions without contract creations', async () => {
    const query = `
      {
        block(number: 5818471) {
          transactions(filter: { contractCreation: false }) {
            hash
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
          transactions: [
            {
              hash: '0x6a36e6a6d438113972cdb538c26ffec7b74956e54fbc9cd161de4aa04a6c5f29',
              to: {
                address: '0x9762f7E018C3e5757aB24505133fa3d5f7863e4B',
              },
            },
            {
              hash: '0x7aa08a605cbc5ba24f7f02c9799061e1ac52c3952dd1e90ada2e914e192ad696',
              to: {
                address: '0x209c4784AB1E8183Cf58cA33cb740efbF3FC18EF',
              },
            },
            {
              hash: '0x3c81277195504bb3a24d40c92ec66d68739b72b5e02ff072ea34dc1473dfae7e',
              to: {
                address: '0x209c4784AB1E8183Cf58cA33cb740efbF3FC18EF',
              },
            },
            {
              hash: '0x8a422114f78db51841301a34f30b9d4c22e9db2e050b596a70bb56c2ce3f58f4',
              to: {
                address: '0xd26114cd6EE289AccF82350c8d8487fedB8A0C07',
              },
            },
            {
              hash: '0xfed4f72fbd5bbf382d1f19a0a66d9fc77167120d8253241fea2fd41a087229a2',
              to: {
                address: '0x814e0908b12A99FeCf5BC101bB5d0b8B5cDf7d26',
              },
            },
            {
              hash: '0xcce27df00acbfaa797bec9d9b7f088b8f2687fe3a805f099b59d2a5c6bbf4d61',
              to: {
                address: '0x8d12A197cB00D4747a1fe03395095ce2A5CC6819',
              },
            },
          ],
        },
      },
    };
    const result = await execQuery(query);
    expect(result).toEqual(expected);
  });

  test('contractCreation: true value, no matching transactions with contract creations', async () => {
    const query = `
      {
        block(number: 5818471) {
          transactions(filter: { contractCreation: true }) {
            hash
            to {
              address
            }
          }
        }
      }
    `;

    const expected = { data: { block: { transactions: [] } } };
    const result = await execQuery(query);
    expect(result).toEqual(expected);
  });

  test('contractCreation: true value, withInput: false value', async () => {
    const query = `
      {
        block(number: 4180981) {
          transactions(filter: { contractCreation: true, withInput: false }) {
            hash
            to {
              address
            }
            inputData
          }
        }
      }
    `;

    const expected = { data: { block: { transactions: [] } } };
    const result = await execQuery(query);
    expect(result).toEqual(expected);
  });

  test('contractCreation: true value, withInput: true value', async () => {
    const query = `
      {
        block(number: 4180981) {
          transactions(filter: { contractCreation: true, withInput: true }) {
            hash
            to {
              address
            }
            inputData
          }
        }
      }
    `;

    const expected = {
      data: {
        block: {
          transactions: [
            {
              hash: '0xab8565481d5edcd162da315bf194b349451b37efbe10e068c601a8cfa84728ca',
              to: {
                address: null,
              },
              inputData: '0x0011',
            },
          ],
        },
      },
    };
    const result = await execQuery(query);
    expect(result).toEqual(expected);
  });

  test('contractCreation: false value, withInput: true value', async () => {
    const query = `
      {
        block(number: 5818471) {
          transactions(filter: { contractCreation: false, withInput: true }) {
            hash
            to {
              address
            }
            inputData
          }
        }
      }
    `;

    const expected = {
      data: {
        block: {
          transactions: [
            {
              hash: '0x8a422114f78db51841301a34f30b9d4c22e9db2e050b596a70bb56c2ce3f58f4',
              to: {
                address: '0xd26114cd6EE289AccF82350c8d8487fedB8A0C07',
              },
              inputData:
                '0xa9059cbb000000000000000000000000ac6ca15c7bf158b72a6fe540c489d802d47c461b00000000000000000000000000000000000000000000000276bed63211810000',
            },
            {
              hash: '0xfed4f72fbd5bbf382d1f19a0a66d9fc77167120d8253241fea2fd41a087229a2',
              to: {
                address: '0x814e0908b12A99FeCf5BC101bB5d0b8B5cDf7d26',
              },
              inputData:
                '0xa9059cbb000000000000000000000000bb72b029a3e5019b504e5a943b9cc445ad40c07d00000000000000000000000000000000000000000000056c5b9528cd492c0000',
            },
            {
              hash: '0xcce27df00acbfaa797bec9d9b7f088b8f2687fe3a805f099b59d2a5c6bbf4d61',
              to: {
                address: '0x8d12A197cB00D4747a1fe03395095ce2A5CC6819',
              },
              inputData:
                '0x0a19b14a0000000000000000000000009501bfc48897dceeadf73113ef635d2ff7ee4b970000000000000000000000000000000000000000000001e7e4171bf4d3a0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000c7d713b49da0000000000000000000000000000000000000000000000000000000000000058e8170000000000000000000000000000000000000000000000000000000065e5427f00000000000000000000000046650facad176e1185bd288e9dee8f842765452a000000000000000000000000000000000000000000000000000000000000001b27ef6e41d789ba96507d3671d20c5978528ff66a865b083fee1c92a61d7a30b562c94617526d96367239e76ad9a2c821b586a55ea95f3444b279ae3ddabba6100000000000000000000000000000000000000000000000bd50cb8b9cad8fd40b',
            },
          ],
        },
      },
    };
    const result = await execQuery(query);
    expect(result).toEqual(expected);
  });

  test('contractCreation: false value, withInput: false value', async () => {
    const query = `
      {
        block(number: 5818471) {
          transactions(filter: { contractCreation: false, withInput: false }) {
            hash
            to {
              address
            }
            inputData
          }
        }
      }
    `;

    const expected = {
      data: {
        block: {
          transactions: [
            {
              hash: '0x6a36e6a6d438113972cdb538c26ffec7b74956e54fbc9cd161de4aa04a6c5f29',
              to: {
                address: '0x9762f7E018C3e5757aB24505133fa3d5f7863e4B',
              },
              inputData: null,
            },
            {
              hash: '0x7aa08a605cbc5ba24f7f02c9799061e1ac52c3952dd1e90ada2e914e192ad696',
              to: {
                address: '0x209c4784AB1E8183Cf58cA33cb740efbF3FC18EF',
              },
              inputData: null,
            },
            {
              hash: '0x3c81277195504bb3a24d40c92ec66d68739b72b5e02ff072ea34dc1473dfae7e',
              to: {
                address: '0x209c4784AB1E8183Cf58cA33cb740efbF3FC18EF',
              },
              inputData: null,
            },
          ],
        },
      },
    };
    const result = await execQuery(query);
    expect(result).toEqual(expected);
  });

  test('withLogs: true/false values', async () => {
    const query = `
      {
        block(number: 5000000) {
          transactionCount
          noLogs: transactions(filter: { withLogs: false }) {
            index
          }
          withLogs: transactions(filter: { withLogs: true }) {
            index
          }
        }
      }
    `;

    const result = await execQuery(query);
    expect(result.errors).toBeUndefined();
    const logSum = result.data.block.noLogs.length + result.data.block.withLogs.length;
    expect(logSum).toBe(result.data.block.transactionCount);
  });
});

describe('transactionFilter on Block->transactionsInvolving', async () => {
  test('withInput: true value, returns only transactions with input data', async () => {
    const query = `
      {
        block(number: 5812961) {
          transactionsInvolving(participants: ["0x10aeaff3b9db519820da523f84fdcbaeac2b1920"], filter: { withInput: true }) {
            hash
            inputData
          }
        }
      }
    `;

    const result = await execQuery(query);
    expect(result.data.block.transactionsInvolving).toHaveLength(1);
    expect(result.data.block.transactionsInvolving[0].inputData).toMatch(/0x.+/);
  });

  test('withInput: false value, returns only transactions without input data (none in this case)', async () => {
    const query = `
      {
        block(number: 5812961) {
          transactionsInvolving(participants: ["0x10aeaff3b9db519820da523f84fdcbaeac2b1920"], filter: { withInput: false }) {
            hash
            inputData
          }
        }
      }
    `;

    const result = await execQuery(query);
    expect(result.data.block.transactionsInvolving).toHaveLength(0);
  });

  test('contractCreation: true value', async () => {
    const query = `
      {
        block(number: 4180981) {
          transactionsInvolving(participants: ["0xa88c0bfd7ffb73201c0df4a065439a9db79198fc"], filter: { contractCreation: true }) {
            hash
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
          transactionsInvolving: [
            {
              hash: '0xab8565481d5edcd162da315bf194b349451b37efbe10e068c601a8cfa84728ca',
              to: {
                address: null,
              },
            },
          ],
        },
      },
    };
    const result = await execQuery(query);
    expect(result).toEqual(expected);
  });

  test('contractCreation: false value', async () => {
    const query = `
      {
        block(number: 4180981) {
          transactionsInvolving(participants: ["0xa88c0bfd7ffb73201c0df4a065439a9db79198fc"], filter: { contractCreation: false }) {
            hash
            to {
              address
            }
          }
        }
      }
    `;

    const expected = { data: { block: { transactionsInvolving: [] } } };
    const result = await execQuery(query);
    expect(result).toEqual(expected);
  });

  test('contractCreation: true value, withInput: true value', async () => {
    const query = `
      {
        block(number: 4180981) {
          transactionsInvolving(participants: ["0xa88c0bfd7ffb73201c0df4a065439a9db79198fc"], filter: { contractCreation: true, withInput: true }) {
            hash
            to {
              address
            }
            inputData
          }
        }
      }
    `;

    const expected = {
      data: {
        block: {
          transactionsInvolving: [
            {
              hash: '0xab8565481d5edcd162da315bf194b349451b37efbe10e068c601a8cfa84728ca',
              to: {
                address: null,
              },
              inputData: '0x0011',
            },
          ],
        },
      },
    };
    const result = await execQuery(query);
    expect(result).toEqual(expected);
  });

  test('contractCreation: true value, withInput: false value', async () => {
    const query = `
      {
        block(number: 4180981) {
          transactionsInvolving(participants: ["0xa88c0bfd7ffb73201c0df4a065439a9db79198fc"], filter: { contractCreation: true, withInput: false }) {
            hash
            to {
              address
            }
            inputData
          }
        }
      }
    `;

    const expected = { data: { block: { transactionsInvolving: [] } } };
    const result = await execQuery(query);
    expect(result).toEqual(expected);
  });

  test('contractCreation: false value, withInput: true value', async () => {
    const query = `
      {
        block(number: 4180981) {
          transactionsInvolving(participants: ["0x2983cac74e33B9785b5f62beF4ccfE61A82460D3"], filter: { contractCreation: false, withInput: true }) {
            hash
            to {
              address
            }
            inputData
          }
        }
      }
    `;

    const expected = {
      data: {
        block: {
          transactionsInvolving: [
            {
              hash: '0xc5b4c2d7e2148f34618f1f7b4c96b68549717901b93b2771e5da4ead16271bda',
              to: {
                address: '0x8d12A197cB00D4747a1fe03395095ce2A5CC6819',
              },
              inputData:
                '0x0a19b14a00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000566c9871f7a400000000000000000000000000056ba2ee7890461f463f7be02aac3099f6d5811a8000000000000000000000000000000000000000000000002b480699e53fe000000000000000000000000000000000000000000000000000000000000003ff2f000000000000000000000000000000000000000000000000000000000828b371d000000000000000000000000f5f4a5dd495cfeaaf264ce122bb4fa4bc0145238000000000000000000000000000000000000000000000000000000000000001baef3eb49a44534661dfd39a8b9fd006983909bb38c3c4ab1276a93d36265d16d6b99225e401ab2ab962e4fd0b25d0cc2e5ecbffc3ee8637e3aeb38aac1583e060000000000000000000000000000000000000000000000000566c9871f7a4000',
            },
            {
              hash: '0xfcf47fd3307c6e08bf21a7799b65e0e3dd770e551328624e96ded53566ec9c22',
              to: {
                address: '0x8d12A197cB00D4747a1fe03395095ce2A5CC6819',
              },
              inputData:
                '0x0a19b14a00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000eaf28ab9d5d1e0000000000000000000000000056ba2ee7890461f463f7be02aac3099f6d5811a8000000000000000000000000000000000000000000000007584d2d24a9ad000000000000000000000000000000000000000000000000000000000000003ff300000000000000000000000000000000000000000000000000000000006422620b000000000000000000000000f2d35387e1a5d497c49463272f99f6843d446d79000000000000000000000000000000000000000000000000000000000000001cd6a668fbebec783b4834d443dad4e5efd7b811c59daf2a2f6a744b76015559e6569d5605efa34d03e7f166d94825b44e83fd76f329af8b06d592d3d4a7c43cf90000000000000000000000000000000000000000000000000eaf28ab9d5d1e00',
            },
            {
              hash: '0xbcb5336667b223aba396512c966170759245da880e974dc0e83bcae0369bf888',
              to: {
                address: '0x8d12A197cB00D4747a1fe03395095ce2A5CC6819',
              },
              inputData:
                '0x0a19b14a00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002b5aad72c652000000000000000000000000000056ba2ee7890461f463f7be02aac3099f6d5811a8000000000000000000000000000000000000000000000015af1d78b58c40000000000000000000000000000000000000000000000000000000000000003ff2fc00000000000000000000000000000000000000000000000000000000b6900231000000000000000000000000f2d35387e1a5d497c49463272f99f6843d446d79000000000000000000000000000000000000000000000000000000000000001c6c99ca9bb74a7aa706b6ee94b687d9ee1f6f7a1d040695504c450fde5cb2f3dd48b235e0342a3ea60817652d25fa32df08c7bf7964f8303b2a3e43673e1dd1420000000000000000000000000000000000000000000000002b5aad72c6520000',
            },
            {
              hash: '0x67c541de3943d0e33171870c3f1bc364f292379dfa3a429009e04e67c491e20e',
              to: {
                address: '0x8d12A197cB00D4747a1fe03395095ce2A5CC6819',
              },
              inputData:
                '0x0a19b14a0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000364bc2e74dce300000000000000000000000000056ba2ee7890461f463f7be02aac3099f6d5811a800000000000000000000000000000000000000000000001b1ae4d6e2ef50000000000000000000000000000000000000000000000000000000000000003ff2fc00000000000000000000000000000000000000000000000000000000b5b08ff2000000000000000000000000f2d35387e1a5d497c49463272f99f6843d446d79000000000000000000000000000000000000000000000000000000000000001c03ee8020c198defc897639368e3f3553edf9b24e32d9ddb5a849e563822aa413083d2955a9cee8186506cfcdf7aafe8ee1d2a7a06ec8e8971b8cff457f88e8f3000000000000000000000000000000000000000000000000364bc2e74dce3000',
            },
            {
              hash: '0x252efb2f452dddca25e2d7f716255b055cb533c9c45a68ec97d21244d88bd4dd',
              to: {
                address: '0x8d12A197cB00D4747a1fe03395095ce2A5CC6819',
              },
              inputData:
                '0x0a19b14a00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002093fe444771500000000000000000000000000056ba2ee7890461f463f7be02aac3099f6d5811a800000000000000000000000000000000000000000000001043561a882930000000000000000000000000000000000000000000000000000000000000003ff2ec00000000000000000000000000000000000000000000000000000000c52c9ded000000000000000000000000456e9f5f0535e7e1a8279fc995fe303941c58c10000000000000000000000000000000000000000000000000000000000000001c1299d8fb663252f6241b0ec555bfc41c677c89eb4b1911362176e70e1095c552683183fe485eb40227f3596b9e79be0fd9350cf1d14b2ed4506b7c3545f8c74d0000000000000000000000000000000000000000000000002093fe4447715000',
            },
          ],
        },
      },
    };
    const result = await execQuery(query);
    expect(result).toEqual(expected);
  });

  test('contractCreation: false value, withInput: false value', async () => {
    const query = `
      {
        block(number: 4180981) {
          transactionsInvolving(participants: ["0xeEe28d484628d41A82d01e21d12E2E78D69920da"], filter: { contractCreation: false, withInput: false }) {
            hash
            to {
              address
            }
            inputData
          }
        }
      }
    `;

    const expected = {
      data: {
        block: {
          transactionsInvolving: [
            {
              hash: '0x010ac81e7e86565481b89943692d25804f376f94756df57cfa48909553e40e8f',
              to: {
                address: '0x66515a286F4384c8d9D15Cca8280b62b8549D47F',
              },
              inputData: null,
            },
            {
              hash: '0x9b360e61a499e2053fb32875ae4bd8f48efbf43ce0fe72fcc4b01ac666cf4b88',
              to: {
                address: '0xf90c0930fAb6Bcf5FFDEDD42df0eeD430a877e4b',
              },
              inputData: null,
            },
            {
              hash: '0xdb461f9d4e9fefc44523f2805a98ad63c0db1117978b969faf95383fcecfcb32',
              to: {
                address: '0x648feFf92DC12E69498C8C05665d0e4b36D5F44B',
              },
              inputData: null,
            },
            {
              hash: '0x7f01afb51cba6a7db642202692a22ae513067c9a6ab5cf83424849fa209b0235',
              to: {
                address: '0x49a5861A3289bEee3f8fB672349dE07472c55E80',
              },
              inputData: null,
            },
          ],
        },
      },
    };
    const result = await execQuery(query);
    expect(result).toEqual(expected);
  });
});

describe('transactionFilter on Block->transactionsRoles', async () => {
  test('withInput: true value, returns only transactions with input data', async () => {
    const query = `
      {
        block(number: 5812961) {
          transactionsRoles(from: "0x10aeaff3b9db519820da523f84fdcbaeac2b1920", filter: { withInput: true }) {
            hash
            inputData
          }
        }
      }
    `;

    const result = await execQuery(query);
    expect(result.data.block.transactionsRoles).toHaveLength(1);
    expect(result.data.block.transactionsRoles[0].inputData).toMatch(/0x.+/);
  });

  test('withInput: false value, returns only transactions without input data (none in this case)', async () => {
    const query = `
      {
        block(number: 5812961) {
          transactionsRoles(from: "0x10aeaff3b9db519820da523f84fdcbaeac2b1920", filter: { withInput: false }) {
            hash
            inputData
          }
        }
      }
    `;

    const result = await execQuery(query);
    expect(result.data.block.transactionsRoles).toHaveLength(0);
  });

  test('contractCreation: true value, returns only transactions with contract creations', async () => {
    const query = `
      {
        block(number: 4180981) {
          transactionsRoles(from: "0xa88c0bfd7ffb73201c0df4a065439a9db79198fc", filter: { contractCreation: true }) {
            hash
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
              hash: '0xab8565481d5edcd162da315bf194b349451b37efbe10e068c601a8cfa84728ca',
              to: {
                address: null,
              },
            },
          ],
        },
      },
    };
    const result = await execQuery(query);
    expect(result).toEqual(expected);
  });

  test('contractCreation: false value, returns only transactions without contract creations', async () => {
    const query = `
      {
        block(number: 4180981) {
          transactionsRoles(from: "0x10aeaff3b9db519820da523f84fdcbaeac2b1920", filter: { contractCreation: false }) {
            hash
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

  test('contractCreation: true value, withInput: true value', async () => {
    const query = `
      {
        block(number: 4180981) {
          transactionsRoles(from: "0xA88C0bFD7FfB73201C0DF4a065439a9DB79198Fc", filter: { contractCreation: true, withInput: true }) {
            hash
            to {
              address
            }
            inputData
          }
        }
      }
    `;

    const expected = {
      data: {
        block: {
          transactionsRoles: [
            {
              hash: '0xab8565481d5edcd162da315bf194b349451b37efbe10e068c601a8cfa84728ca',
              to: {
                address: null,
              },
              inputData: '0x0011',
            },
          ],
        },
      },
    };
    const result = await execQuery(query);
    expect(result).toEqual(expected);
  });

  test('contractCreation: true value, withInput: false value', async () => {
    const query = `
      {
        block(number: 4180981) {
          transactionsRoles(from: "0xA88C0bFD7FfB73201C0DF4a065439a9DB79198Fc", filter: { contractCreation: true, withInput: false }) {
            hash
            to {
              address
            }
            inputData
          }
        }
      }
    `;

    const expected = { data: { block: { transactionsRoles: [] } } };
    const result = await execQuery(query);
    expect(result).toEqual(expected);
  });

  test('contractCreation: false value, withInput: true value', async () => {
    const query = `
      {
        block(number: 4180981) {
          transactionsRoles(from: "0x2983cac74e33B9785b5f62beF4ccfE61A82460D3", filter: { contractCreation: false, withInput: true }) {
            hash
            to {
              address
            }
            inputData
          }
        }
      }
    `;

    const expected = {
      data: {
        block: {
          transactionsRoles: [
            {
              hash: '0xc5b4c2d7e2148f34618f1f7b4c96b68549717901b93b2771e5da4ead16271bda',
              to: {
                address: '0x8d12A197cB00D4747a1fe03395095ce2A5CC6819',
              },
              inputData:
                '0x0a19b14a00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000566c9871f7a400000000000000000000000000056ba2ee7890461f463f7be02aac3099f6d5811a8000000000000000000000000000000000000000000000002b480699e53fe000000000000000000000000000000000000000000000000000000000000003ff2f000000000000000000000000000000000000000000000000000000000828b371d000000000000000000000000f5f4a5dd495cfeaaf264ce122bb4fa4bc0145238000000000000000000000000000000000000000000000000000000000000001baef3eb49a44534661dfd39a8b9fd006983909bb38c3c4ab1276a93d36265d16d6b99225e401ab2ab962e4fd0b25d0cc2e5ecbffc3ee8637e3aeb38aac1583e060000000000000000000000000000000000000000000000000566c9871f7a4000',
            },
            {
              hash: '0xfcf47fd3307c6e08bf21a7799b65e0e3dd770e551328624e96ded53566ec9c22',
              to: {
                address: '0x8d12A197cB00D4747a1fe03395095ce2A5CC6819',
              },
              inputData:
                '0x0a19b14a00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000eaf28ab9d5d1e0000000000000000000000000056ba2ee7890461f463f7be02aac3099f6d5811a8000000000000000000000000000000000000000000000007584d2d24a9ad000000000000000000000000000000000000000000000000000000000000003ff300000000000000000000000000000000000000000000000000000000006422620b000000000000000000000000f2d35387e1a5d497c49463272f99f6843d446d79000000000000000000000000000000000000000000000000000000000000001cd6a668fbebec783b4834d443dad4e5efd7b811c59daf2a2f6a744b76015559e6569d5605efa34d03e7f166d94825b44e83fd76f329af8b06d592d3d4a7c43cf90000000000000000000000000000000000000000000000000eaf28ab9d5d1e00',
            },
            {
              hash: '0xbcb5336667b223aba396512c966170759245da880e974dc0e83bcae0369bf888',
              to: {
                address: '0x8d12A197cB00D4747a1fe03395095ce2A5CC6819',
              },
              inputData:
                '0x0a19b14a00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002b5aad72c652000000000000000000000000000056ba2ee7890461f463f7be02aac3099f6d5811a8000000000000000000000000000000000000000000000015af1d78b58c40000000000000000000000000000000000000000000000000000000000000003ff2fc00000000000000000000000000000000000000000000000000000000b6900231000000000000000000000000f2d35387e1a5d497c49463272f99f6843d446d79000000000000000000000000000000000000000000000000000000000000001c6c99ca9bb74a7aa706b6ee94b687d9ee1f6f7a1d040695504c450fde5cb2f3dd48b235e0342a3ea60817652d25fa32df08c7bf7964f8303b2a3e43673e1dd1420000000000000000000000000000000000000000000000002b5aad72c6520000',
            },
            {
              hash: '0x67c541de3943d0e33171870c3f1bc364f292379dfa3a429009e04e67c491e20e',
              to: {
                address: '0x8d12A197cB00D4747a1fe03395095ce2A5CC6819',
              },
              inputData:
                '0x0a19b14a0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000364bc2e74dce300000000000000000000000000056ba2ee7890461f463f7be02aac3099f6d5811a800000000000000000000000000000000000000000000001b1ae4d6e2ef50000000000000000000000000000000000000000000000000000000000000003ff2fc00000000000000000000000000000000000000000000000000000000b5b08ff2000000000000000000000000f2d35387e1a5d497c49463272f99f6843d446d79000000000000000000000000000000000000000000000000000000000000001c03ee8020c198defc897639368e3f3553edf9b24e32d9ddb5a849e563822aa413083d2955a9cee8186506cfcdf7aafe8ee1d2a7a06ec8e8971b8cff457f88e8f3000000000000000000000000000000000000000000000000364bc2e74dce3000',
            },
            {
              hash: '0x252efb2f452dddca25e2d7f716255b055cb533c9c45a68ec97d21244d88bd4dd',
              to: {
                address: '0x8d12A197cB00D4747a1fe03395095ce2A5CC6819',
              },
              inputData:
                '0x0a19b14a00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002093fe444771500000000000000000000000000056ba2ee7890461f463f7be02aac3099f6d5811a800000000000000000000000000000000000000000000001043561a882930000000000000000000000000000000000000000000000000000000000000003ff2ec00000000000000000000000000000000000000000000000000000000c52c9ded000000000000000000000000456e9f5f0535e7e1a8279fc995fe303941c58c10000000000000000000000000000000000000000000000000000000000000001c1299d8fb663252f6241b0ec555bfc41c677c89eb4b1911362176e70e1095c552683183fe485eb40227f3596b9e79be0fd9350cf1d14b2ed4506b7c3545f8c74d0000000000000000000000000000000000000000000000002093fe4447715000',
            },
          ],
        },
      },
    };
    const result = await execQuery(query);
    expect(result).toEqual(expected);
  });

  test('contractCreation: false value, withInput: false value', async () => {
    const query = `
      {
        block(number: 4180981) {
          transactionsRoles(from: "0xeEe28d484628d41A82d01e21d12E2E78D69920da", filter: { contractCreation: false, withInput: false }) {
            hash
            to {
              address
            }
            inputData
          }
        }
      }
    `;

    const expected = {
      data: {
        block: {
          transactionsRoles: [
            {
              hash: '0x010ac81e7e86565481b89943692d25804f376f94756df57cfa48909553e40e8f',
              to: {
                address: '0x66515a286F4384c8d9D15Cca8280b62b8549D47F',
              },
              inputData: null,
            },
            {
              hash: '0x9b360e61a499e2053fb32875ae4bd8f48efbf43ce0fe72fcc4b01ac666cf4b88',
              to: {
                address: '0xf90c0930fAb6Bcf5FFDEDD42df0eeD430a877e4b',
              },
              inputData: null,
            },
            {
              hash: '0xdb461f9d4e9fefc44523f2805a98ad63c0db1117978b969faf95383fcecfcb32',
              to: {
                address: '0x648feFf92DC12E69498C8C05665d0e4b36D5F44B',
              },
              inputData: null,
            },
            {
              hash: '0x7f01afb51cba6a7db642202692a22ae513067c9a6ab5cf83424849fa209b0235',
              to: {
                address: '0x49a5861A3289bEee3f8fB672349dE07472c55E80',
              },
              inputData: null,
            },
          ],
        },
      },
    };
    const result = await execQuery(query);
    expect(result).toEqual(expected);
  });
});
