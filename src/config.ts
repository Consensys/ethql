import * as commander from 'commander';
import * as _ from 'lodash';

export class Options {
  public jsonrpc?: string;
  public queryMaxSize?: number;
  public port?: number;
}

/* tslint:disable */
const options: Options | commander.Command = commander
  .version('0.0.1')
  .option(
    '-j, --jsonrpc <endpoint>',
    'specify the JSON-RPC endpoint [https://mainnet.infura.io/${INFURA_ID}]; supported transports: http, https, wss, ipc',
    `https://ropsten.infura.io/${process.env.INFURA_ID || ''}`,
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
  .parse(process.argv)
  .opts();
/* tslint: enable */

const env: Options = {
  jsonrpc: process.env.ETHQL_JSONRPC_ENDPOINT,
  queryMaxSize: parseInt(process.env.ETHQL_QUERY_MAX_SIZE) || undefined,
  port: parseInt(process.env.ETHQL_PORT) || undefined,
};

export default _.merge(options, env);
