import * as graphqlHTTP from 'express-graphql';
import {
  GraphQLFieldConfigMap,
  GraphQLInt,
  GraphQLInterfaceType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLScalarType,
  GraphQLSchema,
  GraphQLString,
  Kind,
} from 'graphql';
import * as _ from 'lodash';

import * as express from 'express';
import { Account } from './account';
import { Block } from './block';
import { DecodedTransaction, Erc20TransactionType } from './transaction';
import { web3 } from './web3';

const schema = new GraphQLSchema({
  types: [DecodedTransaction, Erc20TransactionType],
  query: new GraphQLObjectType({
    name: 'Query',
    description: 'Query root',
    fields: {
      account: {
        type: Account,
        args: { address: { type: GraphQLString } },
        resolve: (obj, { address }) => ({ address }),
      },
      block: {
        type: Block,
        args: { number: { type: GraphQLInt }, hash: { type: GraphQLString } },
        resolve: (obj, { blockNumber, hash }) => {
          if ((!hash && !blockNumber) || (hash && blockNumber)) {
            throw new Error('Please provide one argument.');
          }
          return blockNumber ? web3.eth.getBlock(blockNumber, true) : web3.eth.getBlock(hash, true);
        },
      },
      blocks: {
        type: new GraphQLList(Block),
        args: {
          from: { type: GraphQLInt },
          to: { type: GraphQLInt },
          numbers: { type: new GraphQLList(GraphQLInt) },
          hashes: { type: new GraphQLList(GraphQLString) },
        },
        resolve: (obj, { from, to, hashes, numbers }) => {
          if (hashes && hashes.length == 0) {
            hashes = undefined;
          }
          if (numbers && numbers.length == 0) {
            numbers = undefined;
          }
          if (from && from == "") {
            from = undefined;
          }
          if (to && to == "") {
            to = undefined;
          }
          if ((!hashes && !numbers && !from && !to) || 
              ((!from && to) || (from && !to)) ||
              (from && to && (hashes || numbers)) ||
              (numbers && (hashes || from || to)) ||
              (hashes && (numbers || from || to))) {
            throw new Error("Please provide either: (1) both 'from' and 'to', (2) a list of block hashes in 'hashes', or (3) a list of block numbers in 'numbers'.");
          }
          if (hashes) {
            return Promise.all(hashes.map(i => web3.eth.getBlock(i, true)));
          } else if (numbers) {
            return Promise.all(numbers.map(i => web3.eth.getBlock(i, true)));
          } else {
            return Promise.all(_.range(from, to + 1).map(i => web3.eth.getBlock(i, true)));
          }
        },
      },
    },
  }),
});

const app = express();
app.use('/graphql', graphqlHTTP({ schema, graphiql: true }));

app.listen(4000);

console.log('Running a GraphQL API server at http://localhost:4000/graphql');