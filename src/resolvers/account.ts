import { IResolvers } from 'graphql-tools';
import { web3 } from '../providers/web3';
import { longType } from './scalars';

const resolvers: IResolvers = {
  Account: {
    balance({ address }, { unit }) {
      return web3.eth.getBalance(address);
    },
    code({ address }) {
      return web3.eth.getCode(address);
    },
    transactionCount({ address }) {
      return web3.eth.getTransactionCount(address);
    },
  },
  Query: {
    account(obj, { address }) {
      return { address };
    },
  },
};

export default resolvers;
