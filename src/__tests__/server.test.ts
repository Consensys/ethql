import axios from 'axios';
import * as net from 'net';
import { getInfo, startServer, stopServer } from '../server';
import { testGraphql, TestMode } from './utils';

afterEach(() => {
  stopServer();
});

const healthCheckOk = async () => {
  const port = getInfo().port;
  const resp = await axios.post(`http://localhost:${port}/graphql`, { query: '{ health }' });
  expect(resp.data).toEqual({ data: { health: 'ok' } });
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

  await startServer(schema, ctxFactory);

  const info = getInfo();
  expect(info.port).toBeGreaterThan(0);
});

test('server starts with an available port', async () => {
  const { schema, ctxFactory } = testGraphql();
  ctxFactory.config.port = await availablePort();

  await startServer(schema, ctxFactory);

  const info = getInfo();
  expect(info.port).toBe(ctxFactory.config.port);

  await healthCheckOk();
});

test('start twice does nothing on second attempt', async () => {
  const { schema, ctxFactory } = testGraphql();
  ctxFactory.config.port = 0;

  await startServer(schema, ctxFactory);
  await startServer(schema, ctxFactory);

  await healthCheckOk();
});

test('stop twice does nothing on second attempt', async () => {
  const { schema, ctxFactory } = testGraphql();
  ctxFactory.config.port = 0;

  await startServer(schema, ctxFactory);

  const info = getInfo();
  await healthCheckOk();

  stopServer();
  stopServer();

  try {
    await axios.post(`http://localhost:${info.port}/graphql`, { query: '{ health }' });
  } catch (err) {
    return;
  }

  fail('expected a connection error as server should be closed');
});

test('server starts with random port', async () => {
  const { schema, ctxFactory } = testGraphql();
  ctxFactory.config.port = 0;

  await startServer(schema, ctxFactory);

  const info = getInfo();
  expect(info.port).toBeGreaterThan(0);
});

test('JSON RPC endpoint configuration works correctly', async () => {
  const ropsten = testGraphql({
    configOverride: {
      jsonrpc: 'https://ropsten.infura.io',
      port: 0,
    },
    mode: TestMode.passthrough,
  });

  await startServer(ropsten.schema, ropsten.ctxFactory);
  let query = await axios.post(`http://localhost:${getInfo().port}/graphql`, {
    query: '{ block(number: 1) { hash } }',
  });
  const ropstenHash = query.data.data.block.hash;

  stopServer();

  const mainnet = testGraphql({
    configOverride: {
      port: 0,
    },
    mode: TestMode.replay,
  });

  await startServer(mainnet.schema, mainnet.ctxFactory);

  query = await axios.post(`http://localhost:${getInfo().port}/graphql`, { query: '{ block(number: 1) { hash } }' });
  const mainnetHash = query.data.data.block.hash;

  expect(mainnetHash).not.toBeUndefined();
  expect(ropstenHash).not.toBeUndefined();
  expect(mainnetHash).not.toEqual(ropstenHash);
});
