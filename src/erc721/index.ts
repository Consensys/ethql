import { EthqlPluginFactory } from '../plugin';
import { Erc721TokenDecoder } from './decoders';
import resolvers from './resolvers';
import erc721Schema from './schema/erc721';
import erc721TokenSchema from './schema/token';

const plugin: EthqlPluginFactory = config => ({
  name: 'erc721',
  priority: 12,
  resolvers,
  schema: [erc721TokenSchema, erc721Schema],
  serviceDefinitions: {
    decoder: {
      config: {
        decoders: [new Erc721TokenDecoder()],
      },
    },
  },
  dependsOn: {
    services: ['web3', 'ethService', 'decoder', 'erc165Service'],
  },
  order: {
    after: ['core'],
  },
});

export default plugin;
