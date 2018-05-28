import * as express from 'express';
import * as graphqlHTTP from 'express-graphql';
import { importSchema } from 'graphql-import';
import { makeExecutableSchema } from 'graphql-tools';
import * as _ from 'lodash';
import resolvers from './resolvers';

const buildSchema = () => {
  const typeDefs = importSchema(__dirname + '/schema/index.graphql');
  const schema = makeExecutableSchema({ typeDefs, resolvers });
  return schema;
};

const app = express();
app.use('/graphql', graphqlHTTP({ schema: buildSchema(), graphiql: true })).listen(4000);
console.log('Running a GraphQL API server at http://localhost:4000/graphql');
