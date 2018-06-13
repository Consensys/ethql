import { GraphQLSchema } from 'graphql';
import { importSchema } from 'graphql-import';
import { makeExecutableSchema } from 'graphql-tools';
import Web3 = require('web3');
import { Options } from './config';
import initResolvers from './resolvers';

export function initSchema(web3: Web3, config: Options): GraphQLSchema {
  const typeDefs = importSchema(__dirname + '/schema/index.graphql');
  return makeExecutableSchema({ typeDefs, resolvers: initResolvers(web3, config) });
}
