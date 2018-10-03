import ENS = require('ez-ens');
import { EthqlPluginFactory } from '../plugin';
import resolvers from './resolvers';

const plugin: EthqlPluginFactory = config => ({
  name: 'ens',
  priority: 10,
  resolvers,
  dependsOn: {
    services: ['web3'],
  },
  serviceDefinitions: {
    ens: {
      implementation: {
        singleton: () => ENS,
      },
    },
  },
});

export default plugin;
