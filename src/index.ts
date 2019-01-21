import config from './config';
import core from './core';
import ens from './ens';
import erc20 from './erc20';
import { EthqlServer } from './server';

console.log(`Effective configuration:\n${JSON.stringify(config, null, 2)}`);

const server = new EthqlServer({
  config,
  plugins: [core, erc20, ens],
});

const stopFn = async () => {
  await server.stop();
  process.exit(0);
};

process.on('SIGINT', stopFn);
process.on('SIGTERM', stopFn);
server.start();
