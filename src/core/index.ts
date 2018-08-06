import { GraphQLSchema } from 'graphql';
import { importSchema } from 'graphql-import';
import { makeExecutableSchema } from 'graphql-tools';
import resolvers from './resolvers';

export function initSchema(): GraphQLSchema {
  // TODO: move schema to capability / plugin.
  const typeDefs = importSchema(__dirname + '/../schema/index.graphql');
  return makeExecutableSchema({
    typeDefs,
    // create a dummy web3 for resolvers to initialize themselves.
    resolvers,
    resolverValidationOptions: { requireResolversForResolveType: false },
  });
}
