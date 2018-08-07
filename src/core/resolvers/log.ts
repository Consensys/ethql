import { GraphQLResolveInfo } from 'graphql';
import { EthqlContext } from '../../context';
import { EthqlBlock, EthqlLog } from '../model';

/**
 * Attempts to decode the log.
 */
async function decoded(obj: EthqlLog, _, context: EthqlContext) {
  return context.decodingEngine.decodeLog(obj, context);
}

/**
 * Gets the block this log belongs to.
 */
async function block(obj: EthqlLog, _, { ethService }: EthqlContext, info: GraphQLResolveInfo): Promise<EthqlBlock> {
  return ethService.fetchBlock(obj.blockHash, info);
}

export default {
  Log: {
    block,
    decoded,
  },
};
