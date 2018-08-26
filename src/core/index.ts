import { EthqlPluginFactory } from '../plugin';
import resolvers from './resolvers';
import coreSchema from './schema';
import { SimpleDecodingEngine } from './services/decoder/impl/simple';
import { Web3EthService } from './services/eth-service/impl/web3-eth-service';
import { initWeb3 } from './services/web3';

export const plugin: EthqlPluginFactory = prelude => {
  return {
    name: 'core',
    priority: 0,
    resolvers,
    schema: [coreSchema],
    serviceDefinitions: {
      web3: {
        implementation: {
          factory: () => initWeb3(prelude.config),
        },
      },
      ethService: {
        implementation: {
          factory: () => context => new Web3EthService(context.services.web3),
        },
      },
      decoder: {
        config: {
          decoders: [],
        },
        implementation: {
          singleton: ({ decoders }) => {
            const engine = new SimpleDecodingEngine();
            decoders.forEach(d => engine.register(d));
            return engine;
          },
        },
      },
    },
  };
};

export default plugin;
