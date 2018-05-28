import { GraphQLScalarType, Kind } from 'graphql';

export default {
  Long: new GraphQLScalarType({
    name: 'Long',
    description: '64-bit unsigned integer',
    serialize: Number,
    parseValue: Number,
    parseLiteral: ast => (ast.kind === Kind.INT ? parseInt(ast.value, 10) : undefined),
  }),
};
