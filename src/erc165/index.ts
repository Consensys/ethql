import { EthqlPluginFactory } from '../plugin';
import { Erc165InterfaceDecoder } from './decoders';
import resolvers from './resolvers';
import erc165Schema from './schema/erc165';
import { Web3Erc165Service } from './services/impl/web3-erc165-service';

const plugin: EthqlPluginFactory = config => ({
  name: 'erc165',
  priority: 10,
  schema: [erc165Schema],
  resolvers,
  serviceDefinitions: {
    erc165Service: {
      implementation: {
        factory: () => context => new Web3Erc165Service(context.services.web3),
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
