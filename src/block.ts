import { GraphQLFieldConfigMap, GraphQLInt, GraphQLList, GraphQLObjectType, GraphQLString } from 'graphql';
import { Transaction } from './transaction';

const blockFields: GraphQLFieldConfigMap<any, any> = {
  number: { type: GraphQLInt },
  hash: { type: GraphQLString },
  parentHash: { type: GraphQLString },
  nonce: { type: GraphQLString },
  transactionRoot: { type: GraphQLString },
  stateRoot: { type: GraphQLString },
  receiptRoot: { type: GraphQLString },
  miner: { type: GraphQLString },
  extraData: { type: GraphQLString },
  gasLimit: { type: GraphQLInt },
  gasUsed: { type: GraphQLInt },
  timestamp: { type: GraphQLInt },
  transactions: {
    type: new GraphQLList(Transaction),
    resolve: ({ transactions }) =>
      transactions.map(tx => ({ ...tx, from: { address: tx.from }, to: { address: tx.to } })),
  },
};

export const Block = new GraphQLObjectType({
  name: 'Block',
  fields: blockFields,
});
