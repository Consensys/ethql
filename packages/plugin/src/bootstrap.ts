import {
  EthqlBootstrapResult,
  EthqlServiceDefinitions,
  EthqlServiceFactories,
  Options,
  rootSchema,
  runtimeConfig,
} from '@ethql/base';
import * as Debug from 'debug';
import * as deepmerge from 'deepmerge';
import { alg, Graph } from 'graphlib';
import { IResolvers, makeExecutableSchema } from 'graphql-tools';
import * as _ from 'lodash';
import { EthqlPlugin, EthqlPluginFactory } from '.';
const debug = Debug.debug('ethql:bootstrap');

type MergeResult = {
  config: Options;
  schema: string[];
  resolvers: IResolvers<any, any>;
  serviceDefinitions: Partial<EthqlServiceDefinitions>;
};

/**
 * Options for EthQL server.
 */
export type EthqlOptions = {
  config?: Options;
  plugins?: EthqlPluginFactory[];
};

const ERR_MSG_NO_PLUGINS =
  'Cannot start EthQL without plugins; ' +
  "this is likely an internal error as at least the 'core' plugin should be present.";
const ERR_MSG_CORE_REQUIRED = "'core' plugin is required.";
const ERR_MSG_NO_ROOT = 'Plugin graph contains no root, or contains cycles.';
const ERR_MSG_MISSING_SERVICES = missingServices =>
  `Missing services: ${missingServices.map(({ name, missing }) => `${missing}, required by: ${name}`).join(';')}`;
const ERR_MSG_MANY_ROOTS = sources => `Expected plugin graph to be a tree, but there are ${sources.length} roots.`;

/**
 *
 * @param opts Server options.
 */
export function bootstrap(opts: EthqlOptions): EthqlBootstrapResult {
  debug('Bootstrapping Ethql');
  let plugins = opts.plugins.map(pf => pf(opts));

  // Sanity checks.
  if (plugins === null || !plugins.length) {
    throw new Error(ERR_MSG_NO_PLUGINS);
  }

  const validateCore = !(opts.config && opts.config.validation && opts.config.validation.ignoreCorePluginAbsent);
  const coreLoaded = !!_.find(plugins, { name: 'core' });
  if (validateCore && !coreLoaded) {
    throw new Error(ERR_MSG_CORE_REQUIRED);
  }

  // Sort plugins by priority, then build the dependency graph.
  plugins = _.sortBy(plugins, 'priority');
  const graph = new Graph({ directed: true, multigraph: false, compound: false });

  // Populate the dependency graph.
  for (let plugin of plugins) {
    let {
      name,
      order: { after, before },
    } = _.defaultsDeep({ order: { after: [], before: [] } }, plugin);

    // Add the node.
    graph.setNode(name, plugin);

    // Add an implicit dependency on core, if core is not explicitly listed.
    if (coreLoaded && name !== 'core' && ![...after, ...before].includes('core')) {
      after.push('core');
    }

    // Add the edges.
    before.forEach(b => graph.setEdge(name, b));
    after.forEach(a => graph.setEdge(a, name));
  }

  // Sort plugins topologically.
  const orderedPlugins = alg.topsort(graph).map(node => graph.node(node) as EthqlPlugin);

  const sources = graph.sources();
  if (sources.length === 0 || !alg.isAcyclic(graph)) {
    throw new Error(ERR_MSG_NO_ROOT);
  } else if (sources.length > 1) {
    throw new Error(ERR_MSG_MANY_ROOTS(sources));
  }

  console.log(`⚒   Bootstrapping with plugins: ${orderedPlugins.map(p => p.name).join(', ')}.`);

  // Merge schemas, resolvers, serviceDefinitions from all plugins.
  let merged: MergeResult = { config: runtimeConfig, schema: [], resolvers: {}, serviceDefinitions: {} };
  for (let plugin of orderedPlugins) {
    if (typeof plugin.resolvers === 'function') {
      plugin.resolvers = plugin.resolvers(merged.resolvers);
    }
    merged = deepmerge.all([merged, plugin]) as MergeResult;
  }

  const { schema, resolvers, serviceDefinitions } = merged;

  // Ensure that all service requirements are satisfied.
  const serviceImplNames = Object.keys(_.pickBy(serviceDefinitions, 'implementation'));

  const missingServices = plugins
    .filter(plugin => plugin.dependsOn && plugin.dependsOn.services)
    .map(({ name, dependsOn }: EthqlPlugin) => ({
      name,
      missing: dependsOn.services.filter(s => !serviceImplNames.includes(s)),
    }))
    .filter(({ missing }) => missing.length);

  if (missingServices.length) {
    throw new Error(ERR_MSG_MISSING_SERVICES(missingServices));
  }

  const serviceFactories = {};
  for (let [name, def] of Object.entries(serviceDefinitions as EthqlServiceDefinitions)) {
    const { config: serviceConfig, implementation } = def;
    if (implementation) {
      const builder = implementation.factory || implementation.singleton;
      serviceFactories[name] = builder(serviceConfig);
    }
  }

  const result: EthqlBootstrapResult = {
    schema: makeExecutableSchema({
      typeDefs: ''.concat(...[rootSchema, ...schema].map(s => `${s}\n`)),
      resolvers,
      inheritResolversFromInterfaces: true,
      resolverValidationOptions: { requireResolversForResolveType: false },
    }),
    config: runtimeConfig,
    serviceDefinitions: serviceDefinitions as EthqlServiceDefinitions,
    serviceFactories: serviceFactories as EthqlServiceFactories,
  };

  // Initialize all plugins.
  orderedPlugins.forEach(({ init }: EthqlPlugin) => init && init(result));

  return result;
}
