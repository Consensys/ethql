import { GraphQLString, GraphQLObjectType, GraphQLInt } from 'graphql';
import { longType } from './common-types';
import { web3 } from './web3';

const accountFields = {
  address: { type: GraphQLString },
  balance: {
    type: longType,
    args: { unit: { type: GraphQLString } },
    resolve: ({ address }, { unit }) => {
      const balance = web3.eth.getBalance(address);
      return balance;
      // return unit ? (web3 as any).utils.fromWei(balance, unit) : balance;
    }
  },
  code: {
    type: GraphQLString,
    resolve: ({ address }) => web3.eth.getCode(address)
  },
  transactionCount: {
    type: GraphQLInt,
    resolve: ({ address }) => web3.eth.getTransactionCount(address)
  }
};

export const Account = new GraphQLObjectType({
  name: 'Account',
  fields: accountFields
});