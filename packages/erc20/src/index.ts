import { EthqlPluginFactory } from '@ethql/plugin';
import { Erc20TokenDecoder } from './decoders';
import erc20Schema from './schema/erc20';
import tokenSchema from './schema/token';

import '@ethql/core';
import '@ethql/core/dist/services/decoder';
import '@ethql/core/dist/services/eth-service';
import '@ethql/core/dist/services/web3';

export const ERC20_PLUGIN: EthqlPluginFactory = _ => ({
  name: 'erc20',
  priority: 10,
  schema: [erc20Schema, tokenSchema],
  serviceDefinitions: {
    decoder: {
      config: {
        decoders: [new Erc20TokenDecoder()],
      },
    },
  },
  dependsOn: {
    services: ['web3', 'eth', 'decoder'],
  },
  order: {
    after: ['core'],
  },
});
