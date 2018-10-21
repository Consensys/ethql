import { EthqlPluginFactory } from '../plugin';
import { Erc721TokenDecoder } from './decoders';
import erc721Schema from './schema/erc721';

const plugin: EthqlPluginFactory = config => ({
  name: 'erc721',
  priority: 9,
  schema: [erc721Schema],
  serviceDefinitions: {
    decoder: {
      config: {
        decoders: [new Erc721TokenDecoder()],
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
