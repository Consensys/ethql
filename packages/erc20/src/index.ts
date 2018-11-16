import { EthqlPluginFactory } from '@ethql/base/src/plugin';
import { Erc20TokenDecoder } from './decoders';
import erc20Schema from './schema/erc20';
import tokenSchema from './schema/token';

import {} from '@ethql/base/src/core/services/decoder';
import {} from '@ethql/base/src/core/services/eth-service';
import {} from '@ethql/base/src/core/services/web3';

const plugin: EthqlPluginFactory = config => ({
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
    services: ['web3', 'ethService', 'decoder'],
  },
  order: {
    after: ['core'],
  },
});

export default plugin;
