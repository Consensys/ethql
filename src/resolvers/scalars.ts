import { GraphQLScalarType, Kind } from 'graphql';
import { IResolvers } from 'graphql-tools';

// tslint:disable-next-line
import Web3 = require('web3');

export default function(web3: Web3): IResolvers {
  const isHexStrict: (input: string) => boolean = (web3.utils as any).isHexStrict;

  const Long = new GraphQLScalarType({
    name: 'Long',
    description: '64-bit unsigned integer',
    serialize: Number,
    parseValue: Number,
    parseLiteral: ast => (ast.kind === Kind.INT ? parseInt(ast.value, 10) : undefined),
  });

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

  const Address = new GraphQLScalarType({
    name: 'Address',
    description: 'An account address',
    serialize: String,
    parseValue: input => (web3.utils.isAddress(input) ? input : undefined),
    parseLiteral: ast => {
      if (ast.kind !== Kind.STRING || !web3.utils.isAddress(ast.value)) {
        return undefined;
      }
      return String(ast.value);
    },
  });

  const Hash = new GraphQLScalarType({
    name: 'Hash',
    description: 'A Keccak hash, used to identify blocks and transactions',
    serialize: String,
    parseValue: input => {
      return !isHexStrict(input) || web3.utils.hexToBytes(input).length !== 32 ? input : undefined;
    },
    parseLiteral: ast => {
      if (ast.kind !== Kind.STRING || !isHexStrict(ast.value) || web3.utils.hexToBytes(ast.value).length !== 32) {
        return undefined;
      }
      return String(ast.value);
    },
  });

  return { Long, BlockNumber, Address, Hash };
}
