import ENS = require('ez-ens');

import { EthqlPluginFactory } from '@ethql/base';
import '@ethql/core/dist/services/web3';
import resolvers from './resolvers';

import './services';

export const ENS_PLUGIN: EthqlPluginFactory = _ => ({
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
