import * as _ from 'lodash';
import * as graphqlHTTP from 'express-graphql';
import {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLList,
  GraphQLScalarType,
  Kind
} from 'graphql';
import * as express from 'express';
import * as Web3 from 'web3';

const web3: Web3 = new Web3(new Web3.providers.HttpProvider(`https://mainnet.infura.io/${process.env.INFURA_ID}`));

var longType = new GraphQLScalarType({
  name: 'Long',
  description: '64-bit integral numbers',
  serialize: Number,
  parseValue: Number,
  parseLiteral: ast => (ast.kind === Kind.INT ? parseInt(ast.value, 10) : null)
});

const accountFields = {
  address: { type: GraphQLString },
  balance: { type: longType, resolve: ({ address }) => web3.eth.getBalance(address) }
};

const Account = new GraphQLObjectType({
  name: 'Account',
  fields: accountFields
});

const transactionFields = {
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
  input: { type: GraphQLString }
};

const Transaction = new GraphQLObjectType({
  name: 'Transaction',
  fields: transactionFields
});

const blockFields = {
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
      transactions.map(tx => Object.assign(tx, { from: { address: tx.from }, to: { address: tx.to } }))
  }
};

const Block = new GraphQLObjectType({
  name: 'Block',
  fields: blockFields
});

const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    description: 'Query root',
    fields: {
      block: {
        type: Block,
        args: { number: { type: GraphQLInt } },
        resolve: (obj, { number }) => web3.eth.getBlock(number, true)
      },
      blocks: {
        type: new GraphQLList(Block),
        args: { from: { type: GraphQLInt }, to: { type: GraphQLInt } },
        resolve: (obj, { from, to }) => {
          Promise.all(_.range(from, to + 1).map(i => web3.eth.getBlock(i, true)));
        }
      }
    }
  })
});

const app = express();
app.use('/graphql', graphqlHTTP({ schema: schema, graphiql: true }));

app.listen(4000);

console.log('Running a GraphQL API server at localhost:4000/graphql');
