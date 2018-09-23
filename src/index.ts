import config from './config';
import core from './core';
import erc20 from './erc20';
import { EthqlServer } from './server';

console.log(`Effective configuration:\n${JSON.stringify(config, null, 2)}`);

const server = new EthqlServer({
  config,
  plugins: [core, erc20],
});

process.on('SIGINT', async () => (await server.stop()) || process.exit(0));
process.on('SIGTERM', async () => (await server.stop()) || process.exit(0));

server.start();
