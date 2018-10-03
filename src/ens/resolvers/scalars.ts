import { GraphQLScalarType, Kind } from 'graphql';
import Web3 = require('web3');
import { EthqlContext } from '../../context';

function isEnsDomain(input: string) {
  return input.includes('.eth');
}
// tslint:disable-next-line
const Address = new GraphQLScalarType({
  name: 'Address',
  description: 'An account address or ENS domain',
  serialize: String,
  parseValue: input => {
    if (isEnsDomain(input)) {
      return async (context: EthqlContext) => context.services.ens.resolve(input);
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
      return async context => context.services.ens.resolve(ast.value);
    } else {
      return undefined;
    }
  },
});

export default Address;
