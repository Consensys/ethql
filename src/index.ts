import config from './config';
import { EthqlContextFactory } from './context';
import { initSchema } from './core';
import decodingEngine from './dec';
import { initWeb3 } from './providers/web3';
import { EthqlServer } from './server';

console.log(`Effective configuration:\n${JSON.stringify(config, null, 2)}`);

const web3 = initWeb3(config);
const server = new EthqlServer({
  schema: initSchema(),
  ctxFactory: new EthqlContextFactory(web3, config, decodingEngine),
});

process.on('SIGINT', async () => (await server.stop()) || process.exit(0));
process.on('SIGTERM', async () => (await server.stop()) || process.exit(0));

server.start();
