import { GraphQLScalarType, Kind } from 'graphql';

import Web3 = require('web3');

// tslint:disable-next-line
const Address = new GraphQLScalarType({
  name: 'Address',
  description: 'An account address',
  serialize: String,
  parseValue: input => (Web3.utils.isAddress(input) ? input : undefined),
  parseLiteral: ast => {
    if (ast.kind !== Kind.STRING || !Web3.utils.isAddress(ast.value)) {
      return undefined;
    }
    return String(ast.value);
  },
});

// tslint:disable-next-line
const BlockNumber = new GraphQLScalarType({
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
});

// tslint:disable-next-line
const Bytes32 = new GraphQLScalarType({
  name: 'Bytes32',
  description:
    'A 32-byte value in hex format, e.g. Keccak hashes (used to identify blocks and transactions), log topics, etc.',
  serialize: String,
  parseValue: input => {
    return !Web3.utils.isHexStrict(input) || Web3.utils.hexToBytes(input).length !== 32 ? undefined : input;
  },
  parseLiteral: ast => {
    if (
      ast.kind !== Kind.STRING ||
      !Web3.utils.isHexStrict(ast.value) ||
      Web3.utils.hexToBytes(ast.value).length !== 32
    ) {
      return undefined;
    }
    return String(ast.value);
  },
});

//tslint:disable-next-line
const Long = new GraphQLScalarType({
  name: 'Long',
  description: '64-bit unsigned integer',
  serialize: Number,
  parseValue: Number,
  parseLiteral: ast => (ast.kind === Kind.INT ? parseInt(ast.value, 10) : undefined),
});

export default {
  Long,
  BlockNumber,
  Address,
  Bytes32,
};
