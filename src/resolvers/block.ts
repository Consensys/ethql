import { IFieldResolver, IResolvers } from 'graphql-tools';
import * as _ from 'lodash';
import { web3 } from '../providers/web3';
import * as util from 'util';
import { BlockWithoutTransactionData } from 'web3';

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

// Select multiple blocks.
interface IBlocksRangeArgs {
  numbers?: number[];
  hashes?: string[];
}

const blocksRange: IFieldResolver<any, any> = async (obj, { numbers, hashes }: IBlocksRangeArgs) => {
  if (numbers && hashes) {
    throw new Error('Only one of blocks or hashes should be provided.');
  }
  type funcType = (hash: string, callback: (err: Error, res: BlockWithoutTransactionData) => void) => void;
  
  const getBlock: ((string) => Promise<BlockWithoutTransactionData>) = (hash) => {
    return new Promise((res, rej) => {
      web3.eth.getBlock(hash, (err, block) => {
        if (err) {
          rej(err);
        } else {
          res(block);
        }
      });
    });
  };

  let start: number, end:number;

  if (numbers && numbers.length == 2) {
    [start, end] = numbers;
  } else if (hashes && hashes.length == 2) {
    const startBlock = await getBlock(hashes[0]);
    start = startBlock.number;
    const endBlock = await getBlock(hashes[1]);
    end = endBlock.number;
  } else {
    throw new Error('Only the start and end should be provided.');
  }

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