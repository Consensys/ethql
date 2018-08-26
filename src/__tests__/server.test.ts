import axios from 'axios';
import * as _ from 'lodash';
import { EthqlServer, EthqlServerOpts } from '../server';
import { defaultTestServerOpts } from './utils';

import availablePort = require('get-port');

const testServers: EthqlServer[] = [];

const newServer = async (options: EthqlServerOpts = {}) => {
  // _.merge mutates the initial object; hence we use a fresh empty obj.
  const server = new EthqlServer(_.merge({}, defaultTestServerOpts, options));
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
    ropsten: await newServer({ config: { jsonrpc: 'https://ropsten.infura.io' } }),
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
