import { graphql, GraphQLSchema } from 'graphql';
import * as _ from 'lodash';
import { Options } from '../config';
import EthqlContext from '../model/EthqlContext';
import EthqlQuery from '../model/EthqlQuery';
import { initWeb3 } from '../providers/web3';
import { initSchema } from '../schema';
import txDecodingEngine from '../txdec';

const options: Options = {
  jsonrpc: 'https://mainnet.infura.io',
  queryMaxSize: 10,
};

export function testGraphql(
  overrides?: Options,
): { schema: GraphQLSchema; execQuery: (query: string) => ReturnType<typeof graphql> } {
  const config = _.merge({}, options, overrides || {});
  const web3 = initWeb3(config.jsonrpc);
  const context = new EthqlContext(web3, config, txDecodingEngine);
  const schema = initSchema(context);
  const execQuery = (query: string) => {
    return graphql(schema, query, new EthqlQuery(), context);
  };
  return { schema, execQuery };
}
