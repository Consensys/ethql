import { GraphQLResolveInfo } from 'graphql';
import { EthqlContext } from '../../context';
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
  return services.ethService.fetchBlock(obj.blockHash, info);
}

export default {
  Log: {
    block,
    decoded,
  },
};
