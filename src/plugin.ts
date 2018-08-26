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
   * The plugin's priority. During bootstrap, all plugins will be sorted according to their priority before building the startup graph.
   */
  priority: number;
  schema?: string[];
  resolvers?: IResolvers<any, any>;
  serviceDefinitions?: Partial<EthqlServiceDefinitions>;
  dependsOn?: {
    services?: Array<keyof EthqlServices>;
  };
  order?: {
    before?: string[];
    after?: string[];
  };
  init?: (result: EthqlBootstrapResult) => void;
}

export type EthqlPluginFactory = (opts: EthqlServerOpts) => EthqlPlugin;
