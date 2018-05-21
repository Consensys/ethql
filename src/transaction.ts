import { DecodedMethod, DecodedParam } from 'abi-decoder';
import {
  GraphQLEnumType,
  GraphQLFieldConfigMap,
  GraphQLInt,
  GraphQLInterfaceType,
  GraphQLObjectType,
  GraphQLString,
  GraphQLUnionType,
} from 'graphql';
import { Account } from './account';

export const DecodedTransaction = new GraphQLInterfaceType({
  name: 'InterpretedTransaction',
  resolveType: decoded => decoded.type,
  fields: {
    contractType: {
      name: 'ContractType',
      type: GraphQLString,
    },
  },
});

export const Transaction = new GraphQLObjectType({
  name: 'Transaction',
  fields: {
    hash: { type: GraphQLString },
    nonce: { type: GraphQLInt },
    blockHash: { type: GraphQLString },
    blockNumber: { type: GraphQLInt },
    transactionIndex: { type: GraphQLInt },
    from: { type: Account },
    to: { type: Account },
    value: { type: GraphQLString },
    gasPrice: { type: GraphQLString },
    gas: { type: GraphQLInt },
    input: { type: GraphQLString },
    decoded: {
      type: DecodedTransaction,
      resolve: tx => {
        if (!tx.input) {
          return;
        }
        /* If we find a decoder for the transaction, we return the result of the ABI decoding
           enhanced with a 'type' property with the GraphQL type. */
        for (const entry of decoders) {
          const decoded = entry.decoder.decodeMethod(tx.input);
          if (decoded) {
            return { ...decoded, type: entry.type };
          }
        }
      },
    },
  },
});

const extractParamValue = (params: [DecodedParam], name: string) => {
  if (Array.isArray(params) && params.length >= 0) {
    const param = params.find(p => name === p.name);
    return param && param.value;
  }
};

export const Erc20TransactionType = new GraphQLObjectType({
  name: 'ERC20Transaction',
  interfaces: [DecodedTransaction],
  fields: {
    contractType: { type: GraphQLString, resolve: () => 'erc20' },
    action: {
      type: new GraphQLEnumType({
        name: 'ERC20Actions',
        values: {
          approveAndCall: { value: 'approveAndCall' },
          approve: { value: 'approve' },
          transferFrom: { value: 'transferFrom' },
          transfer: { value: 'transfer' },
        },
      }),
      resolve: ({ name }) => name,
    },
    from: {
      type: GraphQLString,
      resolve: ({ params }) => extractParamValue(params, 'from'),
    },
    to: { type: GraphQLString, resolve: ({ params }) => extractParamValue(params, 'to') },
    value: { type: GraphQLString, resolve: ({ params }) => extractParamValue(params, 'value') },
  },
});

const decoders = [
  {
    type: Erc20TransactionType,
    decoder: (() => {
      const decoder = require('abi-decoder');
      decoder.addABI(require('../abi/erc20.json'));
      return decoder;
    })(),
  },
];
