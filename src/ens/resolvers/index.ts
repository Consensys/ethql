import * as _ from 'lodash';
import { EthqlContext } from '../../context';
import { EthqlAccount, EthqlBlock, EthqlTransaction } from '../../core/model';
import Address from './scalars';

export default prev => {
  const resolvers = {
    Address,
    Query: {
      account: async (obj: EthqlBlock, args, context: EthqlContext) => {
        args.address = await args.address(context);
        return prev.Query.account(obj, args, context);
      },
    },
    Block: {
      transactionsInvolving: async (obj: EthqlBlock, args, context: EthqlContext) => {
        args.participants = await Promise.all(args.participants.map(async e => e(context)));
        return prev.Block.transactionsInvolving(obj, args, context);
      },
      transactionsRoles: async (obj: EthqlBlock, args, context: EthqlContext) => {
        if (args.from !== undefined) {
          args.from = await args.from(context);
        }
        if (args.to !== undefined) {
          args.to = await args.to(context);
        }
        return prev.Block.transactionsRoles(obj, args, context);
      },
    },
  };
  return resolvers;
};
