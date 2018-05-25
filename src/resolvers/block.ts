import { IFieldResolver, IResolvers } from 'graphql-tools';
import * as _ from 'lodash';
import { web3 } from '../providers/web3';

// Select a single block.
interface IBlockArgs {
  number?: number;
  hash?: string;
  tag?: string;
}

const block: IFieldResolver<any, any> = (obj, args: IBlockArgs) => {
  let { number: blockNumber, hash, tag } = args;
  hash = hash ? hash.trim() : hash;
  tag = tag ? tag.trim() : tag;

  const arg = _.reject([blockNumber, hash, tag], _.isNil);
  if (!arg) {
    throw new Error('Expected either number, hash or tag argument.');
  }

  if (arg.length > 1) {
    throw new Error('Only one of number, hash or tag argument should be provided.');
  }

  return web3.eth.getBlock(arg[0], true);
};

// Select multiple blocks.
interface IBlocksArgs {
  from?: number;
  to?: number;
  numbers?: number[];
  hashes?: string[];
}

const blocks: IFieldResolver<any, any> = (obj, { from, to, numbers, hashes }: IBlocksArgs) => {
  if (hashes && hashes.length == 0) {
    hashes = undefined;
  }
  if (numbers && numbers.length == 0) {
    numbers = undefined;
  }
  if ((!hashes && !numbers && !from && !to) || 
      ((!from && to) || (from && !to)) ||
      (from && to && (hashes || numbers)) ||
      (numbers && (hashes || from || to)) ||
      (hashes && (numbers || from || to))) {
    throw new Error("Please provide either: (1) both 'from' and 'to', (2) a list of block hashes in 'hashes', or (3) a list of block numbers in 'numbers'.");
  }
  if (hashes) {
    return Promise.all(hashes.map(i => web3.eth.getBlock(i, true)));
  } else if (numbers) {
    return Promise.all(numbers.map(i => web3.eth.getBlock(i, true)));
  } else {
    return Promise.all(_.range(from, to + 1).map(i => web3.eth.getBlock(i, true)));
  }
};

const transactions = (obj, args) =>
  obj.transactions.map(tx => ({ ...tx, from: { address: tx.from }, to: { address: tx.to }, inputData: tx.input }));

const resolvers: IResolvers = {
  Query: {
    block,
    blocks,
  },
  Block: {
    transactions,
  },
};

export default resolvers;