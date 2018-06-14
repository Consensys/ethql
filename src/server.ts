import * as express from 'express';
import * as graphqlHTTP from 'express-graphql';
import { GraphQLSchema } from 'graphql';
import * as http from 'http';
import EthqlContext from './model/EthqlContext';
import EthqlQuery from './model/EthqlQuery';

let app: express.Express;
let httpServer: http.Server;

export async function startServer(schema: GraphQLSchema, context: EthqlContext): Promise<{}> {
  if (httpServer && httpServer.listening) {
    // Server is already started.
    return Promise.resolve({});
  }

  return new Promise((resolve, reject) => {
    app = express();
    app.use('/graphql', graphqlHTTP({ schema, rootValue: new EthqlQuery(), context, graphiql: true }));
    httpServer = app.listen(4000, () => {
      console.log('Running a GraphQL API server at http://localhost:4000/graphql');
      resolve({});
    });
  });
}

export async function stopServer(): Promise<{}> {
  if (!httpServer || !httpServer.listening) {
    // Server is not started.
    return Promise.resolve({});
  }

  return new Promise((resolve, reject) => {
    httpServer.close(() => resolve({}));
  });
}
