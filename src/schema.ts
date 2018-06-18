import { GraphQLSchema } from 'graphql';
import { importSchema } from 'graphql-import';
import { makeExecutableSchema } from 'graphql-tools';
import EthqlContext from './model/EthqlContext';
import initResolvers from './resolvers';

export function initSchema(context: EthqlContext): GraphQLSchema {
  const typeDefs = importSchema(__dirname + '/schema/index.graphql');
  return makeExecutableSchema({
    typeDefs,
    resolvers: initResolvers(context),
    resolverValidationOptions: { requireResolversForResolveType: false },
  });
}
