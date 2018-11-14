import config from '@ethql/base/dist/config';
import core from '@ethql/base/dist/core';
import ens from '@ethql/ens';
import erc20 from '@ethql/erc20';
import { EthqlServer } from '@ethql/base/dist/server';

console.log(`Effective configuration:\n${JSON.stringify(config, null, 2)}`);

const server = new EthqlServer({
  config,
  plugins: [core, erc20, ens],
});

process.on('SIGINT', async () => await server.stop());
process.on('SIGTERM', async () => await server.stop());

server.start();
