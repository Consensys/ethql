import { EthqlPluginFactory } from '../plugin';
import { Erc20TokenDecoder } from './decoders';
import erc20Schema from './schema/erc20';
import tokenSchema from './schema/token';

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
});

export default plugin;
