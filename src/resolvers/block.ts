import { IFieldResolver, IResolvers } from 'graphql-tools';
import * as _ from 'lodash';
import { web3 } from '../providers/web3';

// Select a single block.
interface IBlockArgs {
  number?: number;
  hash?: string;
  tag?: string;
}

const block: IFieldResolver<any, any> = async (obj, args: IBlockArgs) => {
  let { number: blockNumber, hash, tag } = args;
  hash = hash ? hash.trim() : hash;
  tag = tag ? tag.trim() : tag;

  const params = _.reject([blockNumber, hash, tag], _.isNil);
  if (!args) {
    throw new Error('Expected either number, hash or tag argument.');
  }

  if (params.length > 1) {
    throw new Error('Only one of number, hash or tag argument should be provided.');
  }

  const block = await web3.eth.getBlock(params[0]);
  return block ? { transactionCount: block.transactions.length, ...block } : block;
};

// Select multiple blocks.
interface IBlocksArgs {
  numbers?: [number];
  hashes?: [string];
}

const blocks: IFieldResolver<any, any> = async (obj, { numbers, hashes }: IBlocksArgs) => {
  if (numbers && hashes) {
    throw new Error('Only one of blocks or hashes should be provided.');
  }
  const blocks = await Promise.all(
    numbers ? numbers.map(n => web3.eth.getBlock(n)) : hashes.map(h => web3.eth.getBlock(h as any)),
  );
  return blocks.map(block => (block ? { transactionCount: block.transactions.length, ...block } : block));
};

// Select multiple blocks.
interface IBlocksRangeArgs {
  numberRange?: [number, number];
  hashRange?: [string, string];
}

const blocksRange: IFieldResolver<any, any> = async (obj, { numberRange, hashRange }: IBlocksRangeArgs) => {
  if (!(numberRange || hashRange)) {
    throw new Error('Expected either a number range or a hash range.');
  }

  if (numberRange && hashRange) {
    throw new Error('Only one of blocks or hashes should be provided.');
  }

  let start: number;
  let end: number;

  if (numberRange && numberRange.length === 2) {
    // We've received start and end block numbers.
    [start, end] = numberRange;
    if (start < 0 || end < 0) {
      throw new Error('Invalid block number provided.');
    }
  } else if (hashRange && hashRange.length === 2) {
    // We've received start and end hashes, so we need to resolve them to block numbers first to delimit the range.
    const blocks = await Promise.all(hashRange.map(b => web3.eth.getBlock(b as any)));
    if (blocks.indexOf(null) >= 0) {
      throw new Error('Could not resolve the block associated with one or all hashes.');
    }
    [start, end] = blocks.map(b => b.number);
  } else {
    throw new Error('Exactly two elements were expected: the start and end blocks.');
  }

  if (start > end) {
    throw new Error('Start block in the range must be prior to the end block.');
  }

  const blocksRange = Array.from({ length: end - start + 1 }, (v, k) => k + start);
  return Promise.all(blocksRange.map(blockNumber => web3.eth.getBlock(blockNumber, true)));
};

const transactions = (obj, args) =>
  obj.transactions.map(tx => ({ ...tx, from: { address: tx.from }, to: { address: tx.to }, inputData: tx.input }));

const transactionAt = (obj, args) => obj.transactions[args.index];

const resolvers: IResolvers = {
  Query: {
    block,
    blocks,
    blocksRange,
  },
  Block: {
    transactions,
    transactionAt,
  },
};

export default resolvers;
