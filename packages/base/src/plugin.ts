import { IResolvers } from 'graphql-tools';
import { EthqlBootstrapResult } from './bootstrap';
import { EthqlServerOpts } from './server';
import { EthqlServiceDefinitions, EthqlServices } from './services';

export interface EthqlPlugin {
  /**
   * A unique identifier for this plugin.
   */
  name: string;

  /**
   * The plugin's priority. During bootstrap, all plugins will be sorted according to their
   * priority before building the startup graph.
   */
  priority: number;

  /**
   * The GraphQL schemas this plugin adds, in GraphQL IDL format.
   */
  schema?: string[];

  /**
   * The resolver tree this plugin adds. It will be deeply merged via reduction with other plugins,
   * where the sequence is determined by the priority and the order.
   */
  resolvers?: IResolvers<any, any> | ((prev: IResolvers<any, any>) => IResolvers<any, any>);

  /**
   * The services this plugin adds or modifies. Plugins can replace implementations of services,
   * or can provide configuration parameters to pre-existing services.
   */
  serviceDefinitions?: Partial<EthqlServiceDefinitions>;

  /**
   * The elements this plugin depends on. Currently plugins can only depend on services. The
   * bootstrapping procedure will ensure implementations of these services are available during
   * startup.
   */
  dependsOn?: {
    services?: Array<keyof EthqlServices>;
  };

  /**
   * Establishes explicit ordering relationships with other plugins by name.
   */
  order?: {
    before?: string[];
    after?: string[];
  };

  /**
   * A function that will be called with the bootstrap result, allowing plugins to perform any
   * necessary initialization.
   */
  init?: (result: EthqlBootstrapResult) => void;
}

export type EthqlPluginFactory = (opts: EthqlServerOpts) => EthqlPlugin;
