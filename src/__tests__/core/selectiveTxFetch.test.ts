import { testGraphql } from '../utils';

const { execQuery, prepareContext } = testGraphql();

let context;
let spy: jest.SpyInstance;

beforeEach(() => {
  context = prepareContext();
  spy = jest.spyOn(context.web3.eth, 'getBlock');
});

afterEach(() => {
  spy.mockClear();
});

test('selective TX fetch: block with transactions (triggered by transactionsRoles)', async () => {
  const query = `
    {
      block(hash: "0x4b3c1d7e65a507b62734feca1ee9f27a5379e318bd52ae62de7ba67dbeac66a3") {
        transactionsRoles(from: "0xA88C0bFD7FfB73201C0DF4a065439a9DB79198Fc", filter: { contractCreation: true, withInput: true }) {
          hash
        }
      }
    }
  `;

  await execQuery(query, context);
  expect(spy).toHaveBeenCalledTimes(1);
  expect(spy.mock.calls[0][1]).toBe(true);
});

test('selective TX fetch: blocksRange with transactions (triggered by transactionsInvolving)', async () => {
  const query = `
    {
      blocksRange(numberRange: [5755715, 5755717]) {
        transactionsInvolving(participants: [
          "0xE99DDae9181957E91b457E4c79A1B577E55a5742",
          "0xe5b9746dfCC2eF1054D47A451A77bb5f390c468d",
          "0x364904669aA5eDd0d5BF8e64E63442152344d5CA"]) {
          hash
        }
      }
    }
  `;

  await execQuery(query, context);
  expect(spy).toHaveBeenCalledTimes(3);
  spy.mock.calls.forEach(c => expect(c[1]).toBe(true));
});

test('selective TX fetch: block without transactions', async () => {
  const query = `
    {
      blocks(numbers: [5755715, 5755716, 5755717, 5755718]) {
        hash
      }
    }
  `;

  await execQuery(query, context);
  expect(spy).toHaveBeenCalledTimes(4);
  spy.mock.calls.forEach(c => expect(c[1]).toBe(false));
});

test('selective TX fetch: blocksRange without transactions', async () => {
  const query = `
    {
      blocksRange(numberRange: [10, 19]) {
        hash
      }
    }
  `;

  await execQuery(query, context);
  expect(spy).toHaveBeenCalledTimes(10);
  spy.mock.calls.forEach(c => expect(c[1]).toBe(false));
});

test('selective TX fetch: blocks with transactions (triggered by transactions)', async () => {
  const query = `
    {
      blocks(numbers: [10, 20, 25, 900, 19]) {
        transactions {
          hash
        }
      }
    }
  `;

  await execQuery(query, context);
  expect(spy).toHaveBeenCalledTimes(5);
  spy.mock.calls.forEach(c => expect(c[1]).toBe(true));
});
