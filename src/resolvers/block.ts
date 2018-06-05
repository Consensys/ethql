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
  numbers?: [number];
  hashes?: [string];
}

const blocks: IFieldResolver<any, any> = (obj, { numbers, hashes }: IBlocksArgs) => {
  if (numbers && hashes) {
    throw new Error('Only one of blocks or hashes should be provided.');
  }
  const f = v => web3.eth.getBlock(v, true);
  return Promise.all(numbers ? numbers.map(f) : hashes.map(f));
};

const blocksRange: IFieldResolver<any, any> = (obj, { numbers, hashes }: IBlocksArgs) => {
  if (numbers && hashes) {
    throw new Error('Only one of blocks or hashes should be provided.');
  }
  if ((numbers && numbers.length > 2) || (hashes && hashes.length > 2)) {
    throw new Error('Only the start and end of the range should be provided.');
  }

  const start = numbers? numbers[0] : web3.eth.getBlock(hashes[0]).number;
  const end = numbers? numbers[1] : web3.eth.getBlock(hashes[1]).number;
  console.log(start, end);
  const f = v => web3.eth.getBlock(v, true);

  const blocksRange = Array.from({length: (end - start + 1)}, (v, k) => k + start);

  return Promise.all(blocksRange.map(f));
};

const transactions = (obj, args) =>
  obj.transactions.map(tx => ({ ...tx, from: { address: tx.from }, to: { address: tx.to }, inputData: tx.input }));

const resolvers: IResolvers = {
  Query: {
    block,
    blocks,
    blocksRange,
  },
  Block: {
    transactions,
  },
};

export default resolvers;
