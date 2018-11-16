import config from '@ethql/base/src/config';
import core from '@ethql/base/src/core';
import { EthqlServer } from '@ethql/base/src/server';
import ens from '@ethql/ens';
import erc20 from '@ethql/erc20';

console.log(`Effective configuration:\n${JSON.stringify(config, null, 2)}`);

const server = new EthqlServer({
  config,
  plugins: [core, erc20, ens],
});

process.on('SIGINT', async () => server.stop());
process.on('SIGTERM', async () => server.stop());

server.start();
