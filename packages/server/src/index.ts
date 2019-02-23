import { runtimeConfig } from '@ethql/base';
import { CORE_PLUGIN } from '@ethql/core';
import { ENS_PLUGIN } from '@ethql/ens';
import { ERC20_PLUGIN } from '@ethql/erc20';

import { EthqlServer } from './server';

console.log(`Effective configuration:\n${JSON.stringify(runtimeConfig, null, 2)}`);

const server = new EthqlServer({
  config: runtimeConfig,
  plugins: [CORE_PLUGIN, ERC20_PLUGIN, ENS_PLUGIN],
});

const stopFn = async () => {
  await server.stop();
  process.exit(0);
};

process.on('SIGINT', stopFn);
process.on('SIGTERM', stopFn);

server.start();
