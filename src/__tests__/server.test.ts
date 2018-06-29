import axios from 'axios';
import * as net from 'net';
import { Options } from '../config';
import { EthqlContextFactory } from '../model/EthqlContext';
import { getAddress, startServer, stopServer } from '../server';
import { testGraphql } from './utils';


afterEach(() => {
  stopServer();
});

const healthcheckOk = async () => {
  const address = getAddress();
  const resp = await axios.post(`http://localhost:${address.port}/graphql`, { query: '{ health }' });
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

  const address = getAddress();
  expect(address.port).toBeGreaterThan(0);
});

test('server starts with an available port', async () => {
  const { schema, ctxFactory } = testGraphql();
  ctxFactory.config.port = await availablePort();

  await startServer(schema, ctxFactory);

  const address = getAddress();
  expect(address.port).toBe(ctxFactory.config.port);

  await healthcheckOk();
});

test('start twice does nothing on second attempt', async () => {
  const { schema, ctxFactory } = testGraphql();
  ctxFactory.config.port = 0;

  await startServer(schema, ctxFactory);
  await startServer(schema, ctxFactory);

  await healthcheckOk();
});

test('stop twice does nothing on second attempt', async () => {
  const { schema, ctxFactory } = testGraphql();
  ctxFactory.config.port = 0;

  await startServer(schema, ctxFactory);

  const address = getAddress();
  await healthcheckOk();

  stopServer();
  stopServer();

  try {
    await axios.post(`http://localhost:${address.port}/graphql`, { query: '{ health }' });
  } catch (err) {
    return;
  }

  fail('expected a connection error as server should be closed');
});

const getPort = async (options?: Options) => {
  const { schema, ctxFactory } = testGraphql(options);
  ctxFactory.config.port = await availablePort();

  await startServer(schema, ctxFactory);

  const address = getAddress();
  await healthcheckOk;
  return address.port;
};

const ropstenOptions: Options = {
  jsonrpc: 'https://ropsten.infura.io',
};

test('JSON RPC endpoint configuration works correctly', async () => {
  let query;

  try {
    query = await axios.post(`http://localhost:${await getPort()}/graphql`, { query: '{ block(number: 1) { hash } }' });
  } catch (err) {
    return;
  }
  const mainnetHash = query.data.data.block.hash;

  stopServer();

  try {
    query = await axios.post(`http://localhost:${await getPort(ropstenOptions)}/graphql`, { query: '{ block(number: 1) { hash } }' });
  } catch (err) {
    return;
  }
  const ropstenHash = query.data.data.block.hash;

  expect(mainnetHash === ropstenHash).toEqual(false);
});