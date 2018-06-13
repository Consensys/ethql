import { IFieldResolver, IResolvers } from 'graphql-tools';
import * as _ from 'lodash';
import Web3 = require('web3');
import { Options } from '../config';

// Select a single block.
interface IBlockArgs {
  number?: number;
  hash?: string;
  tag?: string;
}

// Select multiple blocks.
interface IBlocksArgs {
  numbers?: [number];
  hashes?: [string];
}

// Select multiple blocks.
interface IBlocksRangeArgs {
  numberRange?: [number, number];
  hashRange?: [string, string];
}

export default function(web3: Web3, config: Options): IResolvers {
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

    const block = await web3.eth.getBlock(params[0], true);
    return block ? { transactionCount: block.transactions.length, ...block } : block;
  };

  const blocks: IFieldResolver<any, any> = async (obj, { numbers, hashes }: IBlocksArgs) => {
    if (numbers && hashes) {
      throw new Error('Only one of numbers or hashes should be provided.');
    }
    if (!(numbers || hashes)) {
      throw new Error('At least one of numbers or hashes must be provided.');
    }
    if ((numbers && numbers.length > config.queryMaxSize) || (hashes && hashes.length > config.queryMaxSize)) {
      throw new Error(`Too large a multiple selection. Maximum length allowed: ${config.queryMaxSize}.`);
    }

    let input: any[] = numbers
      ? numbers.map(n => web3.eth.getBlock(n, true))
      : hashes.map(h => web3.eth.getBlock(h as any, true));
    const blocks = await Promise.all(input);
    return blocks.map(block => (block ? { transactionCount: block.transactions.length, ...block } : block));
  };

  const blocksRange: IFieldResolver<any, any> = async (obj, { numberRange, hashRange }: IBlocksRangeArgs) => {
    if (numberRange && hashRange) {
      throw new Error('Only one of blocks or hashes should be provided.');
    }
    if (!(numberRange || hashRange)) {
      throw new Error('Expected either a number range or a hash range.');
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
      const blocks = await Promise.all(hashRange.map(b => web3.eth.getBlock(b as any, true)));
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
    if (end - start + 1 > config.queryMaxSize) {
      throw new Error(`Too large a multiple selection. Maximum length allowed: ${config.queryMaxSize}.`);
    }

    const blocksRange = Array.from({ length: end - start + 1 }, (v, k) => k + start);
    return Promise.all(blocksRange.map(blockNumber => web3.eth.getBlock(blockNumber, true)));
  };

  const transactions = (obj, args) =>
    obj.transactions.map(tx => ({ ...tx, from: { address: tx.from }, to: { address: tx.to }, inputData: tx.input }));

  const transactionAt = (obj, args) => obj.transactions[args.index];

  return {
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
}
