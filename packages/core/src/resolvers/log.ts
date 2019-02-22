import { EthqlContext } from '@ethql/base';
import { GraphQLResolveInfo } from 'graphql';
import { EthqlBlock, EthqlLog } from '../model';

/**
 * Attempts to decode the log.
 */
async function decoded(obj: EthqlLog, args, context: EthqlContext) {
  return context.services.decoder.decodeLog(obj, context);
}

/**
 * Gets the block this log belongs to.
 */
async function block(obj: EthqlLog, args, { services }: EthqlContext, info: GraphQLResolveInfo): Promise<EthqlBlock> {
  return services.eth.fetchBlock(obj.blockHash, info);
}

export default {
  Log: {
    block,
    decoded,
  },
};
