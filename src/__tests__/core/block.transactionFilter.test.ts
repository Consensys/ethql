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
});
