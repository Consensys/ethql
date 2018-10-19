import { EthqlPluginFactory } from '../plugin';
import { Erc165InterfaceDecoder } from './decoders';
import resolvers from './resolvers';
import erc165Schema from './schema/erc165';

const plugin: EthqlPluginFactory = config => ({
  name: 'erc165',
  priority: 10,
  schema: [erc165Schema],
  resolvers,
  // serviceDefinitions: {
  //   decoder: {
  //     config: {
  //       decoders: [new Erc165InterfaceDecoder()],
  //     },
  //   },
  // },
  dependsOn: {
    services: ['web3', 'ethService', 'decoder'],
  },
  order: {
    after: ['core'],
  },
});

export default plugin;
