import { GraphQLScalarType, Kind } from 'graphql';

import * as web3Utils from 'web3-utils';

// tslint:disable-next-line
const Address = new GraphQLScalarType({
  name: 'Address',
  description: 'An account address',
  serialize: String,
  parseValue: input => (web3Utils.isAddress(input) ? input : undefined),
  parseLiteral: ast => {
    if (ast.kind !== Kind.STRING || !web3Utils.isAddress(ast.value)) {
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
    return !web3Utils.isHexStrict(input) || web3Utils.hexToBytes(input).length !== 32 ? undefined : input;
  },
  parseLiteral: ast => {
    if (
      ast.kind !== Kind.STRING ||
      !web3Utils.isHexStrict(ast.value) ||
      web3Utils.hexToBytes(ast.value).length !== 32
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
