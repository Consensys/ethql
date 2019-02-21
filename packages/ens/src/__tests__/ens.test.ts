import { CORE_PLUGIN } from '@ethql/core';
import { testGraphql } from '@ethql/plugin';
import { ENS_PLUGIN } from '..';

const { execQuery } = testGraphql({ opts: { plugins: [CORE_PLUGIN, ENS_PLUGIN] }});

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

test('account: select by ens domain: parseValue', async () => {
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

test('transactionRoles: filter by `to` ens domain', async () => {
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

test('transactionRoles: filter by `from` ens domain', async () => {
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

test('transactionsInvolving: filter by ens domain', async () => {
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

test('account: select by address still works (regression test)', async () => {
  const query = `
    {
      account(address: "0xfb6916095ca1df60bb79ce92ce3ea74c37c5d359") {
        code
        transactionCount
      }
    }
  `;
  const result = await execQuery(query);
  expect(result.data.account.code).not.toBeNull();
});

test('transactionRoles: filter by address still works (regression test)', async () => {
  const query = `
  {
    block(hash: "0x27cb5d9151939faeb4d5604b4ddb69fefcd166e690a9c1c9a235c024f376e49f") {
      transactionsRoles(to: "0xfb6916095ca1df60bb79ce92ce3ea74c37c5d359") {
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

test('transactionsInvolving: filter by address still works (regression test)', async () => {
  const query = `
  {
    block(hash: "0x27cb5d9151939faeb4d5604b4ddb69fefcd166e690a9c1c9a235c024f376e49f") {
      transactionsInvolving(participants: ["0xfb6916095ca1df60bb79ce92ce3ea74c37c5d359"]) {
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
