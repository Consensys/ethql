import commander from 'commander';
import _ from 'lodash';

export class Options {
  public jsonrpc?: string;
  public queryMaxSize?: number;
  public port?: number;
  public batching?: boolean;
  public caching?: boolean;
  public validation?: {
    ignoreCorePluginAbsent?: boolean;
  };
}

const DEFAULT_PROJECT_ID = '70c53878c5a94e7f8d4043df3f8ef755'
/* tslint:disable */
const options: Options | commander.Command = commander
  .version('0.0.1')
  .option(
    '-j, --jsonrpc <endpoint>',
    'specify the JSON-RPC endpoint [https://mainnet.infura.io/v3/${INFURA_ID}]; supported transports: http, https, wss, ipc',
    `https://mainnet.infura.io/v3/${process.env.INFURA_ID || DEFAULT_PROJECT_ID}`,
  )
  .option(
    '-m, --query-max-size <limit>',
    'specify the maximum number of elements allowed in multiple selection queries',
    10,
  )
  .option(
    '-p, --port <number>', //
    'specify the port number on which the GraphQL HTTP server will listen on',
    4000,
  )
  .option(
    '-b, --batching <enabled>', //
    'enables or disables JSON-RPC batching (default: true)',
    true,
  )
  .option(
    '-c, --caching <enabled>', //
    'enables or disables JSON-RPC caching; ignored and disabled if batching is disabled (default: true)',
    true,
  )
  .parse(process.argv)
  .opts();
/* tslint: enable */

const env: Options = {
  jsonrpc: process.env.ETHQL_JSONRPC_ENDPOINT,
  queryMaxSize: parseInt(process.env.ETHQL_QUERY_MAX_SIZE) || undefined,
  port: parseInt(process.env.ETHQL_PORT) || undefined,
  batching: process.env.ETHQL_BATCHING === undefined ? undefined : process.env.ETHQL_BATCHING === 'true',
  caching: process.env.ETHQL_CACHING === undefined ? undefined : process.env.ETHQL_CACHING === 'true',
};

export const runtimeConfig = _.merge({}, options, env);

