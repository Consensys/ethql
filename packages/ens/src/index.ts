import { EthqlPluginFactory } from '@ethql/base/src/plugin';
import ENS = require('ez-ens');
import resolvers from './resolvers';

import {} from '@ethql/base/src/core/services/web3';

const plugin: EthqlPluginFactory = config => ({
  name: 'ens',
  priority: 20,
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
