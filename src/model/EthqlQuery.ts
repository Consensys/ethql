import { GraphQLResolveInfo } from 'graphql';
import * as _ from 'lodash';
import Eth from 'web3/eth';
import EthqlAccount from './core/EthqlAccount';
import EthqlBlock from './core/EthqlBlock';
import EthqlTransaction from './core/EthqlTransaction';
import { EthqlContext } from './EthqlContext';

// Select a single block.
interface BlockArgs {
  number?: number;
  hash?: string;
  tag?: string;
}

// Select a single block with an offset.
interface BlockOffsetArgs {
  number?: number;
  hash?: string;
  offset?: number;
  tag?: string;
}

// Select multiple blocks.
interface BlocksArgs {
  numbers?: [number];
  hashes?: [string];
}

// Select multiple blocks.
interface BlocksRangeArgs {
  numberRange?: [number, number];
  hashRange?: [string, string];
}

class EthqlQuery {
  /**
   * Returns a block.
   *
   * @param obj
   * @param args
   */
  public async block(args: BlockArgs, context: EthqlContext, info: GraphQLResolveInfo): Promise<EthqlBlock> {
    let { number: blockNumber, hash, tag } = args;
    hash = hash ? hash.trim() : hash;
    tag = tag ? tag.trim().toLowerCase() : tag;

    const params = _.reject([blockNumber, hash, tag], _.isNil);

    if (!params.length) {
      throw new Error('Expected either number, hash or tag argument.');
    }
    if (params.length > 1) {
      throw new Error('Only one of number, hash or tag argument should be provided.');
    }

    return EthqlBlock.load(params[0], context, info);
  }

  public async blockOffset(
    { number, hash, offset, tag }: BlockOffsetArgs,
    context: EthqlContext,
    info: GraphQLResolveInfo,
  ): Promise<EthqlBlock> {
    if ((!number && !hash) || (!offset && offset !== 0)) {
      throw new Error('Expected either number or hash argument and offset argument.');
    }
    if (number && hash) {
      throw new Error('Only one of number or hash argument should be provided.');
    }

    if (hash) {
      const block = await context.web3.eth.getBlock(hash);
      return EthqlBlock.load(block.number + offset, context, info);
    }

    return EthqlBlock.load(number + offset, context, info);
  }

  public async blocks(
    { numbers, hashes }: BlocksArgs,
    context: EthqlContext,
    info: GraphQLResolveInfo,
  ): Promise<EthqlBlock[]> {
    if (numbers && hashes) {
      throw new Error('Only one of numbers or hashes should be provided.');
    }

    if (!(numbers || hashes)) {
      throw new Error('At least one of numbers or hashes must be provided.');
    }

    if (
      (numbers && numbers.length > context.config.queryMaxSize) ||
      (hashes && hashes.length > context.config.queryMaxSize)
    ) {
      throw new Error(`Too large a multiple selection. Maximum length allowed: ${context.config.queryMaxSize}.`);
    }

    let input = numbers
      ? numbers.map(n => EthqlBlock.load(n, context, info))
      : hashes.map(h => EthqlBlock.load(h, context, info));

    return Promise.all(input);
  }

  public async blocksRange(
    { numberRange, hashRange }: BlocksRangeArgs,
    context: EthqlContext,
    info: GraphQLResolveInfo,
  ): Promise<EthqlBlock[]> {
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
      const blocks = await Promise.all(hashRange.map(b => context.web3.eth.getBlock(b as any, false)));
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

    if (end - start + 1 > context.config.queryMaxSize) {
      throw new Error(`Too large a multiple selection. Maximum length allowed: ${context.config.queryMaxSize}.`);
    }

    const blocksRange = Array.from({ length: end - start + 1 }, (v, k) => k + start);
    return Promise.all(blocksRange.map(blockNumber => EthqlBlock.load(blockNumber, context, info)));
  }

  public account({ address }): EthqlAccount {
    return new EthqlAccount(address);
  }

  public async transaction({ hash }, context: EthqlContext): Promise<EthqlTransaction> {
    return EthqlTransaction.loadStandalone(hash, context);
  }

  public health() {
    return 'ok';
  }
}

export default EthqlQuery;
