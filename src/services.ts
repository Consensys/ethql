import { EthqlContext } from './context';

export type EthqlServiceDefinition<Config, Service> = {
  config?: Config;
  implementation?: {
    singleton?: (config: Config) => Service;
    factory?: (config: Config) => (context: EthqlContext) => Service;
  };
};

export type EthqlServiceFactories = {
  [P in keyof EthqlServiceDefinitions]: EthqlServiceDefinitions[P] extends EthqlServiceDefinition<
    infer Config,
    infer Service
  >
    ? (context: EthqlContext) => Service
    : never
};

/**
 * Lazily initialises any services when they are requested,
 * and memoises them for the lifetime of the context.
 */
export class EthqlServices implements EthqlServices {
  private cache = {};

  constructor(factories: EthqlServiceFactories, private context: EthqlContext) {
    for (const [name, factoryOrObj] of Object.entries(factories)) {
      Object.defineProperty(this, name, {
        get: () =>
          this.cache[name] ||
          (this.cache[name] = typeof factoryOrObj === 'function' ? factoryOrObj(this.context) : factoryOrObj),
      });
    }
  }
}
