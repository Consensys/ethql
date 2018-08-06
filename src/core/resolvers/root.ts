import { GraphQLResolveInfo } from 'graphql';
import * as _ from 'lodash';
import { EthqlContext } from '../../context';
import { EthqlAccount, EthqlBlock, EthqlTransaction } from '../model';

// Select a single block.
type BlockArgs = { number?: number; hash?: string; tag?: string };

// Select a single block with an offset.
type BlockOffsetArgs = { number?: number; hash?: string; offset?: number; tag?: string };

// Select multiple blocks.
type BlocksArgs = { numbers?: number[]; hashes?: string[] };

// Select multiple blocks.
type BlocksRangeArgs = { numberRange?: [number, number]; hashRange?: [string, string] };

async function block(
  obj,
  args: BlockArgs,
  { ethService }: EthqlContext,
  info: GraphQLResolveInfo,
): Promise<EthqlBlock> {
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

  return ethService.fetchBlock(params[0], info);
}

async function blockOffset(
  obj: never,
  args: BlockOffsetArgs,
  { ethService }: EthqlContext,
  info: GraphQLResolveInfo,
): Promise<EthqlBlock> {
  const { number, hash, tag, offset } = args;
  const params = _.reject([number, hash, tag], _.isNil);

  // Offset 0 is allowed.
  if (offset === undefined || params.length === 0) {
    throw new Error('Expected either number, tag or hash argument and offset argument.');
  }

  if (params.length > 1) {
    throw new Error('Only one of number, hash or tag argument should be provided.');
  }

  const blockNumber = number || (await ethService.fetchBlock(hash || tag.toLowerCase(), {})).number;
  return ethService.fetchBlock(blockNumber + offset, info);
}

async function blocks(
  obj: never,
  { numbers, hashes }: BlocksArgs,
  { ethService, config }: EthqlContext,
  info: GraphQLResolveInfo,
): Promise<EthqlBlock[]> {
  const { queryMaxSize } = config;

  if (numbers && hashes) {
    throw new Error('Only one of numbers or hashes should be provided.');
  }

  if (!(numbers || hashes)) {
    throw new Error('At least one of numbers or hashes must be provided.');
  }

  if ((numbers && numbers.length > queryMaxSize) || (hashes && hashes.length > queryMaxSize)) {
    throw new Error(`Too large a multiple selection. Maximum length allowed: ${queryMaxSize}.`);
  }

  let input = numbers
    ? numbers.map(n => ethService.fetchBlock(n, info))
    : hashes.map(h => ethService.fetchBlock(h, info));

  return Promise.all(input);
}

async function blocksRange(
  obj: never,
  { numberRange, hashRange }: BlocksRangeArgs,
  { ethService, config }: EthqlContext,
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
    const blocks = await Promise.all(hashRange.map(b => ethService.fetchBlock(b as any, {})));
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

  const blocksRange = Array.from({ length: end - start + 1 }, (_, k) => k + start);
  return Promise.all(blocksRange.map(blockNumber => ethService.fetchBlock(blockNumber, info)));
}

function account(obj: never, { address }): EthqlAccount {
  return new EthqlAccount(address);
}

function transaction(obj: never, { hash }, { ethService }: EthqlContext): Promise<EthqlTransaction> {
  return ethService.fetchStandaloneTx(hash);
}

export default {
  Query: {
    block,
    blocks,
    blockOffset,
    blocksRange,
    account,
    transaction,
  },
};
