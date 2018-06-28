import { GraphQLSchema } from 'graphql';
import { importSchema } from 'graphql-import';
import { makeExecutableSchema } from 'graphql-tools';
import { EthqlContextFactory } from './model/EthqlContext';
import initResolvers from './resolvers';

export function initSchema(ctxFactory: EthqlContextFactory): GraphQLSchema {
  const typeDefs = importSchema(__dirname + '/schema/index.graphql');
  return makeExecutableSchema({
    typeDefs,
    // create a dummy web3 for resolvers to initialize themselves.
    resolvers: initResolvers(ctxFactory.create()),
    resolverValidationOptions: { requireResolversForResolveType: false },
  });
}
