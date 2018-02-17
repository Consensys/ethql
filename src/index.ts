import * as express from 'express';
import * as graphqlHTTP from 'express-graphql';
import { GraphQLSchema, GraphQLObjectType, GraphQLString, GraphQLInt, GraphQLList, GraphQLScalarType, Kind } from 'graphql';
import Web3Type from 'web3';
import * as _ from 'lodash';

const Web3 = require('web3');
const web3: Web3Type = new Web3(new Web3.providers.HttpProvider("https://mainnet.infura.io/..."));

var longType = new GraphQLScalarType({
    name: 'Long',
    description: '64-bit integral numbers',
    serialize: Number,
    parseValue: Number,
    parseLiteral: function parseLiteral(ast) {
        if (ast.kind === Kind.INT) {
            const num = parseInt(ast.value, 10);
            return num;
        }
        return null;
    }
});

const accountFields = {
    address: { type: GraphQLString },
    balance: { type: longType, resolve: (account) => web3.eth.getBalance(account.address) }
}

const Account = new GraphQLObjectType({
    name: "Account",
    fields: accountFields
})

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
}

const Transaction = new GraphQLObjectType({
    name: 'Transaction',
    fields: transactionFields
});

const blockFields = {
    'number': { type: GraphQLInt },
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
        resolve: (source) => {
            const transform = (tx) => {
                const { from, to } = tx;
                tx.from = { address: from };
                tx.to = { address: to };
                return tx;
            };
            return source.transactions.map(transform)
        }
    }
};

const Block = new GraphQLObjectType({
    name: 'Block',
    fields: blockFields
});

const schema = new GraphQLSchema({
    query: new GraphQLObjectType({
        name: 'Query',
        description: "Query root",
        fields: {
            block: {
                type: Block,
                args: { 'number': { type: GraphQLInt } },
                resolve: (source, args) => web3.eth.getBlock(args.number, true)
            },
            blocks: {
                type: new GraphQLList(Block),
                args: { from: { type: GraphQLInt }, to: { type: GraphQLInt } },
                resolve: (source, { from, to }) => {
                    return Promise.all(_.range(from, to + 1).map(i => web3.eth.getBlock(i, true)));
                }
            }
        }
    })
});

const app = express();
app.use("/graphql", graphqlHTTP({
    schema: schema,
    graphiql: true
}));

app.listen(4000);

console.log('Running a GraphQL API server at localhost:4000/graphql');
