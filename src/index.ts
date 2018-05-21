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
import { Block } from './block';
import { DecodedTransaction, Erc20TransactionType } from './transaction';
import { web3 } from './web3';

const schema = new GraphQLSchema({
  types: [DecodedTransaction, Erc20TransactionType],
  query: new GraphQLObjectType({
    name: 'Query',
    description: 'Query root',
    fields: {
      block: {
        type: Block,
        args: { number: { type: GraphQLInt } },
        resolve: (obj, { blockNumber }) => web3.eth.getBlock(blockNumber, true),
      },
      blocks: {
        type: new GraphQLList(Block),
        args: { from: { type: GraphQLInt }, to: { type: GraphQLInt } },
        resolve: (obj, { from, to }) => Promise.all(_.range(from, to + 1).map(i => web3.eth.getBlock(i, true))),
      },
    },
  }),
});

const app = express();
app.use('/graphql', graphqlHTTP({ schema, graphiql: true }));

app.listen(4000);

console.log('Running a GraphQL API server at http://localhost:4000/graphql');
