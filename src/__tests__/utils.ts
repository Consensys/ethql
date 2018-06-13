import { GraphQLSchema } from 'graphql';
import * as _ from 'lodash';
import { Options } from '../config';
import { initWeb3 } from '../providers/web3';
import { initSchema } from '../schema';

const options: Options = {
  jsonrpc: 'https://mainnet.infura.io',
  queryMaxSize: 10,
};

export function testSchema(overrides?: Options): GraphQLSchema {
  const config = _.merge({}, options, overrides || {});
  const web3 = initWeb3(config.jsonrpc);
  return initSchema(web3, config);
}
