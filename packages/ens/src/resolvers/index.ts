import { EthqlContext } from '@ethql/base';
import { EthqlBlock } from '@ethql/core';
import * as _ from 'lodash';
import { Address, addressFn } from './scalars';

// This uses the _reduction_ approach for installing plugin resolvers.
// `prev` is the entire resolver tree prior to loading this plugin.
//
// We do the following:
// * replace the `Address` scalar resolver with our own.
// * wrap the resolvers that consume an `Address` scalar. They now resolve
//   the address Promise, and then feed the result into the original resolver.
//   Remember: this is because graphql-js cannot automatically handle promises
//   returned by scalar resolvers. Instead, it will pipe through the
//   actual promise. The address Promise will resolve immediately if the user
//   provided an actual address, or it will wait for the ENS resolution to come
//   back if they provided a name.
export default prev => {
  const resolvers = {
    Address,
    Query: {
      account: async (obj: EthqlBlock, args, context: EthqlContext) => {
        if (typeof args.address === 'function') {
          const addrFn: addressFn = args.address;
          args.address = await addrFn(context);
        }
        return prev.Query.account(obj, args, context);
      },
    },
    Block: {
      transactionsInvolving: async (obj: EthqlBlock, args, context: EthqlContext) => {
        const toAddrPromiseFn = val => (typeof val === 'function' ? val(context) : Promise.resolve(val));
        args.participants = await Promise.all(args.participants.map(toAddrPromiseFn));
        return prev.Block.transactionsInvolving(obj, args, context);
      },
      transactionsRoles: async (obj: EthqlBlock, args, context: EthqlContext) => {
        if (args.from !== undefined && typeof args.from === 'function') {
          args.from = await args.from(context);
        }
        if (args.to !== undefined && typeof args.to === 'function') {
          args.to = await args.to(context);
        }
        return prev.Block.transactionsRoles(obj, args, context);
      },
    },
  };
  return resolvers;
};
