import { EthqlContext } from '@ethql/base';
import { GraphQLScalarType, Kind } from 'graphql';
import Web3 = require('web3');

function isEnsDomain(input: string) {
  return input.includes('.eth');
}

// A 1-arg thunk for resolving an ENS name into an address.
//
// It takes a context containing an ENS resolution service, and returns a Promise
// that resolves to the thunked ETH address.
type addressFn = (context: EthqlContext) => Promise<string>;

// tslint:disable-next-line
const Address = new GraphQLScalarType({
  name: 'Address',
  description: 'An account address or ENS domain',
  serialize: String,
  parseValue: input => {
    if (isEnsDomain(input)) {
      // If this is an ENS domain, return a 1-arg thunk. See docs on `addressFn` type.
      const addrFn: addressFn = async context => context.services.ens.resolve(input, {web3: context.services.web3});
      return addrFn;
    } else if (Web3.utils.isAddress(input)) {
      return input;
    } else {
      return undefined;
    }
  },
  parseLiteral: ast => {
    if (ast.kind !== Kind.STRING) {
      return undefined;
    } else if (Web3.utils.isAddress(ast.value)) {
      return ast.value;
    } else if (isEnsDomain(ast.value)) {
      // If this is an ENS domain, return a 1-arg thunk. See docs on `addressFn` type.
      const addrFn: addressFn = async context => context.services.ens.resolve(ast.value, {web3: context.services.web3});
      return addrFn;
    } else {
      return undefined;
    }
  },
});

export { Address, addressFn };
