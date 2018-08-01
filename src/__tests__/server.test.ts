import axios from 'axios';
import * as net from 'net';
import { EthqlServer } from '../server';
import { testGraphql, TestMode } from './utils';

const testServers: EthqlServer[] = [];

afterEach(async () => {
  console.log('Shutting down test servers...');
  await testServers.forEach(async server => {
    try {
      await server.stop();
    } catch (e) {
      // do nothing
    }
  });
  testServers.length = 0;
  console.log('Test servers shut down.');
});

const healthCheckOk = async () => {
  testServers.forEach(async server => {
    const port = server.address.port;
    const resp = await axios.post(`http://localhost:${port}/graphql`, { query: '{ health }' });
    expect(resp.data).toEqual({ data: { health: 'ok' } });
  });
};

const availablePort = async () => {
  const srv = net.createServer();
  await srv.listen(0);
  const port = (srv.address() as net.AddressInfo).port;
  await srv.close();
  return port;
};

test('server starts with random port', async () => {
  const { schema, ctxFactory } = testGraphql();
  ctxFactory.config.port = 0;

  const server = new EthqlServer({ schema, ctxFactory });
  testServers.push(server);
  await server.start();

  expect(server.address.port).toBeGreaterThan(0);
  await healthCheckOk();
});

test('server starts with an available port', async () => {
  const { schema, ctxFactory } = testGraphql();
  ctxFactory.config.port = await availablePort();

  const server = new EthqlServer({ schema, ctxFactory });
  testServers.push(server);
  await server.start();

  expect(server.address.port).toBe(ctxFactory.config.port);
  await healthCheckOk();
});

test('start twice throws on second attempt', async () => {
  const { schema, ctxFactory } = testGraphql();
  ctxFactory.config.port = 0;

  const server = new EthqlServer({ schema, ctxFactory });
  testServers.push(server);

  await server.start();
  await healthCheckOk();

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
  const { schema, ctxFactory } = testGraphql();
  ctxFactory.config.port = 0;

  const server = new EthqlServer({ schema, ctxFactory });
  testServers.push(server);

  await server.start();
  await healthCheckOk();
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

test('server starts with random port', async () => {
  const { schema, ctxFactory } = testGraphql();
  ctxFactory.config.port = 0;

  const server = new EthqlServer({ schema, ctxFactory });
  testServers.push(server);
  await server.start();
  await healthCheckOk();

  expect(server.address.port).toBeGreaterThan(0);
});

test('JSON RPC endpoint configuration works correctly', async () => {
  const servers = {
    ropsten: new EthqlServer(
      testGraphql({
        configOverride: {
          jsonrpc: 'https://ropsten.infura.io',
          port: 0,
        },
        mode: TestMode.passthrough,
      }),
    ),
    mainnet: new EthqlServer(
      testGraphql({
        configOverride: {
          port: 0,
        },
        mode: TestMode.replay,
      }),
    ),
  };

  Object.values(servers).forEach(async s => {
    testServers.push(s);
    await s.start();
  });

  await healthCheckOk();

  const hashes = Object.values(servers).map(async s => {
    const resp = await axios.post(`http://localhost:${s.address.port}/graphql`, {
      query: '{ block(number: 1) { hash } }',
    });
    return resp.data.data.block.hash;
  });

  expect(hashes).toHaveLength(2);
  expect(hashes[0]).not.toBe(hashes[1]);
});
