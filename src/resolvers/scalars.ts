import { GraphQLScalarType, Kind } from 'graphql';

// tslint:disable-next-line
const web3 = require('web3');

export default {
  Long: new GraphQLScalarType({
    name: 'Long',
    description: '64-bit unsigned integer',
    serialize: Number,
    parseValue: Number,
    parseLiteral: ast => (ast.kind === Kind.INT ? parseInt(ast.value, 10) : undefined),
  }),
  BlockNumber: new GraphQLScalarType({
    name: 'BlockNumber',
    description: 'A block number (unsigned 64-bit integer)',
    serialize: Number,
    parseValue: input => {
      const val = Number(input);
      return val >= 0 ? val : undefined;
    },
    parseLiteral: ast => {
      if (ast.kind !== Kind.INT) {
        return undefined;
      }
      const val = parseInt(ast.value, 10);
      return val >= 0 ? val : undefined;
    },
  }),
  Address: new GraphQLScalarType({
    name: 'Address',
    description: 'An account address',
    serialize: Number,
    parseValue: input => (web3.utils.isAddress(input) ? input : undefined),
    parseLiteral: ast => {
      if (ast.kind !== Kind.STRING || !web3.utils.isAddress(ast.value)) {
        return undefined;
      }
      return String(ast.value);
    },
  }),
};
