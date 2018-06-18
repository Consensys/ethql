import axios, { AxiosError } from 'axios';
import * as net from 'net';
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
  const { schema, context } = testGraphql();
  context.config.port = 0;

  await startServer(schema, context);

  const address = getAddress();
  expect(address.port).toBeGreaterThan(0);
});

test('server starts with an available port', async () => {
  const { schema, context } = testGraphql();
  context.config.port = await availablePort();

  await startServer(schema, context);

  const address = getAddress();
  expect(address.port).toBe(context.config.port);

  await healthcheckOk();
});

test('start twice does nothing on second attempt', async () => {
  const { schema, context } = testGraphql();
  context.config.port = 0;

  await startServer(schema, context);
  await startServer(schema, context);

  await healthcheckOk();
});

test('stop twice does nothing on second attempt', async () => {
  const { schema, context } = testGraphql();
  context.config.port = 0;

  await startServer(schema, context);

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
