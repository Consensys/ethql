import ENS = require('ez-ens');

import '@ethql/core';
import { EthqlPluginFactory } from '@ethql/plugin';
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
