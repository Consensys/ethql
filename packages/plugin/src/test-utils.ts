import { EthqlBootstrapResult, EthqlContext } from '@ethql/base';
import { graphql } from 'graphql';
import * as _ from 'lodash';
import { bootstrap, EthqlOptions } from './bootstrap';

const currentTestMode = (process.env.ETHQL_TEST_MODE || '').toLowerCase().trim();

export enum TestMode {
  'record',
  'replay',
  'passthrough',
}

/**
 * Test runner options.
 */
export type TestRunnerOpts = {
  opts?: EthqlOptions;
  mode?: TestMode;
  contextPreparer?: (bootstrap: EthqlBootstrapResult, runnerOpts: TestRunnerOpts) => EthqlContext;
};

export const DEFAULT_TEST_RUNNER_OPTS: TestRunnerOpts = {
  mode: currentTestMode in TestMode ? TestMode[currentTestMode] : TestMode.replay,
  opts: {
    config: {
      jsonrpc: 'https://mainnet.infura.io/v3/70c53878c5a94e7f8d4043df3f8ef755',
      queryMaxSize: 10,
      batching: true,
      caching: true,
      port: 0,
      validation: {
        ignoreCorePluginAbsent: true,
      },
    },
  },
};

/**
 * Instantiates a test GraphQL schema.
 *
 * @param testOptions Options for the test runner.
 */
export function testGraphql(opts?: TestRunnerOpts) {
  const runnerOpts = _.merge({}, DEFAULT_TEST_RUNNER_OPTS, opts || {});
  const bootstrapResult = bootstrap(runnerOpts.opts);
  const { schema, serviceFactories } = bootstrapResult;
  const prepareContext = opts.contextPreparer || (() => new EthqlContext(runnerOpts.opts.config, serviceFactories));

  const execQuery = (query: string, context?: EthqlContext, variables?: { [key: string]: any }) => {
    return graphql(schema, query, {}, context || prepareContext(bootstrapResult, runnerOpts), variables);
  };

  return { schema, prepareContext: () => prepareContext(bootstrapResult, runnerOpts), execQuery };
}