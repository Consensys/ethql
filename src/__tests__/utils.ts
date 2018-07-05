import { graphql } from 'graphql';
import * as _ from 'lodash';
import { Options } from '../config';
import { EthqlContext, EthqlContextFactory } from '../model/EthqlContext';
import EthqlQuery from '../model/EthqlQuery';
import { initWeb3 } from '../providers/web3';
import { initSchema } from '../schema';
import txDecodingEngine from '../txdec';

const options: Options = {
  jsonrpc: 'https://mainnet.infura.io',
  queryMaxSize: 10,
  batching: true,
  caching: true,
};

export function testGraphql(overrides?: Options) {
  const config = _.merge({}, options, overrides || {});
  const web3 = initWeb3(config);
  const ctxFactory = new EthqlContextFactory(web3, config, txDecodingEngine);
  const schema = initSchema(ctxFactory);

  const prepareContext = () => ctxFactory.create();
  const execQuery = (query: string, context?: EthqlContext) => {
    return graphql(schema, query, new EthqlQuery(), context || prepareContext());
  };

  return { schema, prepareContext, execQuery, ctxFactory };
}
