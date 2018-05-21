import { GraphQLScalarType, Kind } from 'graphql';

export const longType = new GraphQLScalarType({
  name: 'Long',
  description: '64-bit integral numbers',
  serialize: Number,
  parseValue: Number,
  parseLiteral: ast => (ast.kind === Kind.INT ? parseInt(ast.value, 10) : undefined),
});
