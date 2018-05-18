import * as _ from 'lodash';
import * as graphqlHTTP from 'express-graphql';
import {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLList,
  GraphQLScalarType,
  GraphQLNonNull,
  Kind,
  GraphQLFieldConfigMap,
  GraphQLInterfaceType
} from 'graphql';

import * as express from 'express';
import { Account } from './account';
import { Block } from './block';
import { web3 } from './web3';
import { DecodedTransaction, Erc20TransactionType } from './transaction';

const schema = new GraphQLSchema({
  types: [DecodedTransaction, Erc20TransactionType],
  query: new GraphQLObjectType({
    name: 'Query',
    description: 'Query root',
    fields: {
      account: {
        type: Account,
        args: { address: { type: GraphQLString } },
        resolve: (obj, { address }) => { return { address } }
      },
      block: {
        type: Block,
        args: { number: { type: GraphQLInt } },
        resolve: (obj, { number }) => web3.eth.getBlock(number, true)
      },
      blocks: {
        type: new GraphQLList(Block),
        args: { from: { type: GraphQLInt }, to: { type: GraphQLInt } },
        resolve: (obj, { from, to }) => Promise.all(_.range(from, to + 1).map(i => web3.eth.getBlock(i, true)))
      },
    }
  })
});

const app = express();
app.use('/graphql', graphqlHTTP({ schema: schema, graphiql: true }));

app.listen(4000);

console.log('Running a GraphQL API server at http://localhost:4000/graphql');