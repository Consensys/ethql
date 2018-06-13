import { IResolvers } from 'graphql-tools';
import Web3 = require('web3');

export default function(web3: Web3): IResolvers {
  return {
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
}
