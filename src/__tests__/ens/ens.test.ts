import core from '../../core';
import ens from '../../ens';
import { testGraphql } from '../utils';

const { execQuery } = testGraphql({
  optsOverride: {
    config: {
      jsonrpc: 'https://mainnet.infura.io',
      queryMaxSize: 10,
      batching: true,
      caching: true,
      port: 0,
    },
    plugins: [core, ens],
  },
});

test('account: select by ens domain: parseLiteral', async () => {
  const query = `
    {
      account(address: "ethereum.eth") {
        code
        transactionCount
      }
    }
  `;
  const result = await execQuery(query);
  expect(result.data.account.code).not.toBeNull();
});

test('account: select by ens domain: parseLiteral', async () => {
  const query = `
    query($address: Address!) {
      account(address: $address) {
        address
      }
    }
  `;
  const vars = { address: 'ethereum.eth' };
  const result = await execQuery(query, null, vars);
  expect(result.data.account.code).not.toBeNull();
});

test('account: error when input invalid', async () => {
  const query = `
    {
      account(address: "not an address") {
        code
        transactionCount
      }
    }
  `;
  const result = await execQuery(query);
  expect(result.errors).toHaveLength(1);
  expect(result.errors[0].message).toMatch(/^Expected type Address\!/);
});

test('transactionRoles: select by to ens domain', async () => {
  const query = `
  {
    block(hash: "0x27cb5d9151939faeb4d5604b4ddb69fefcd166e690a9c1c9a235c024f376e49f") {
      transactionsRoles(to: "ethereum.eth") {
        hash
      }
    }
  }
`;

  const expected = {
    data: {
      block: { transactionsRoles: [{ hash: '0x7ae9514a2e6601571076176fb93b86ba6dfdf4025549485535e4b95757c86c4b' }] },
    },
  };
  const result = await execQuery(query);
  expect(result).toEqual(expected);
});

test('transactionRoles: select by from ens domain', async () => {
  const query = `
  {
    block(hash: "0x27cb5d9151939faeb4d5604b4ddb69fefcd166e690a9c1c9a235c024f376e49f") {
      transactionsRoles(from: "ethereum.eth") {
        hash
      }
    }
  }
`;

  const expected = {
    data: {
      block: { transactionsRoles: [] },
    },
  };
  const result = await execQuery(query);
  expect(result).toEqual(expected);
});

test('transactionsInvolving: select by ens domain', async () => {
  const query = `
  {
    block(hash: "0x27cb5d9151939faeb4d5604b4ddb69fefcd166e690a9c1c9a235c024f376e49f") {
      transactionsInvolving(participants: ["ethereum.eth"]) {
        hash
      }
    }
  }
`;

  const expected = {
    data: {
      block: {
        transactionsInvolving: [{ hash: '0x7ae9514a2e6601571076176fb93b86ba6dfdf4025549485535e4b95757c86c4b' }],
      },
    },
  };
  const result = await execQuery(query);
  expect(result).toEqual(expected);
});
