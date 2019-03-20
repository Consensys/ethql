import { EthqlOptions } from '@ethql/plugin';
import axios from 'axios';
import availablePort = require('get-port');
import * as _ from 'lodash';
import { EthqlServer } from '../server';

import { CORE_PLUGIN } from '@ethql/core';
import { ENS_PLUGIN } from '@ethql/ens';
import { ERC20_PLUGIN } from '@ethql/erc20';

const testServers: EthqlServer[] = [];

const defaultOpts: EthqlOptions = {
  config: {
    jsonrpc: 'https://mainnet.infura.io/v3/70c53878c5a94e7f8d4043df3f8ef755',
    queryMaxSize: 10,
    port: 0,
    validation: {
      ignoreCorePluginAbsent: true,
    },
  },
  plugins: [CORE_PLUGIN, ENS_PLUGIN, ERC20_PLUGIN],
};

const newServer = async (options: EthqlOptions = {}) => {
  // _.merge mutates the initial object; hence we use a fresh empty obj.
  const server = new EthqlServer(_.merge({}, defaultOpts, options));
  testServers.push(server);

  await server.start();

  // Healthcheck.
  const resp = await axios.post(`http://localhost:${server.address.port}/graphql`, { query: '{ health }' });
  expect(resp.data).toEqual({ data: { health: 'ok' } });

  return server;
};

afterAll(async () => {
  console.log('Shutting down test servers...');
  await Promise.all(
    testServers.map(s =>
      s.stop().catch(err => console.log(`Exception while cleaning up servers (may be expected): ${err}`)),
    ),
  );
  testServers.length = 0;
  console.log('Test servers shut down.');
});

test('server starts with random port', async () => {
  const server = await newServer();
  expect(server.address.port).toBeGreaterThan(0);
});

test('server starts with an available port', async () => {
  const port = await availablePort();
  const server = await newServer({ config: { port } });
  expect(server.address.port).toBe(port);
});

test('start twice throws on second attempt', async () => {
  const server = await newServer();

  try {
    await server.start();
  } catch (e) {
    expect(e).toBeInstanceOf(Error);
    expect((e as Error).message).toMatch(/^Illegal EthQL server state/);
    return;
  }
  fail('Expected when starting server twice exception');
});

test('stop twice throws on second attempt', async () => {
  const server = await newServer();
  await server.stop();

  try {
    await server.stop();
  } catch (e) {
    expect(e).toBeInstanceOf(Error);
    expect((e as Error).message).toMatch(/^Illegal EthQL server state/);
    return;
  }
  fail('Expected when starting server twice exception');
});

test('JSON RPC endpoint configuration works correctly', async () => {
  const servers = {
    ropsten: await newServer({ config: { jsonrpc: 'https://ropsten.infura.io/v3/70c53878c5a94e7f8d4043df3f8ef755' } }),
    mainnet: await newServer(),
  };

  const hashes = Object.values(servers).map(async s => {
    const resp = await axios.post(`http://localhost:${s.address.port}/graphql`, {
      query: '{ block(number: 1) { hash } }',
    });
    return resp.data.data.block.hash;
  });

  expect(hashes).toHaveLength(2);
  expect(hashes[0]).not.toBe(hashes[1]);
});
