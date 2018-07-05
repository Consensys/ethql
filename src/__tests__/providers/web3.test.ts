import { initWeb3 } from '../../providers/web3';

function skipIfUndefined(prop: any) {
  return prop ? test : test.skip;
}

const endpoints = {
  https: 'https://mainnet.infura.io',
  wss: 'wss://mainnet.infura.io/ws',
  http: process.env.TEST_HTTP_ENDPOINT,
  // ws: process.env.TEST_WS_ENDPOINT,
  ipc1: process.env.TEST_IPC_PATH,
  ipc2: process.env.TEST_IPC_PATH ? `ipc://${process.env.TEST_IPC_PATH}` : undefined,
};

skipIfUndefined(endpoints.http)('web3 initialized with HTTP endpoint', async () => {
  const web3 = initWeb3({ jsonrpc: endpoints.http })();
  const { hash } = await web3.eth.getBlock(0x01);
  expect(hash).not.toBeUndefined();
});

// skipIfUndefined(endpoints.ws)('web3 initialized with WS endpoint', async () => {
//   const web3 = initWeb3({ jsonrpc: endpoints.ws });
//   const { hash } = await web3.eth.getBlock(0x01);
//   expect(hash).not.toBeUndefined();
// });

test('web3 initialized with HTTPS endpoint', async () => {
  const web3 = initWeb3({ jsonrpc: endpoints.https })();
  const { hash } = await web3.eth.getBlock(0x01);
  expect(hash).not.toBeUndefined();
});

test('web3 initialized with WSS endpoint', async () => {
  const web3 = initWeb3({ jsonrpc: endpoints.wss })();
  const { hash } = await web3.eth.getBlock(0x01);
  expect(hash).not.toBeUndefined();
});

skipIfUndefined(endpoints.ipc1)('web3 initialized with IPC endpoint (path)', async () => {
  const web3 = initWeb3({ jsonrpc: endpoints.ipc1 })();
  const { hash } = await web3.eth.getBlock(0x01);
  expect(hash).not.toBeUndefined();
});

skipIfUndefined(endpoints.ipc2)('web3 initialized with IPC endpoint (URI)', async () => {
  const web3 = initWeb3({ jsonrpc: endpoints.ipc2 })();
  const { hash } = await web3.eth.getBlock(0x01);
  expect(hash).not.toBeUndefined();
});
