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
  if (blocks && hashes) {
    throw new Error('Only one of blocks or hashes should be provided.');
  }
  return Promise.all(_.map(blocks ? blocks : hashes, v => web3.eth.getBlock(v, true)));
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
