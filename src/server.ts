import * as express from 'express';
import * as graphqlHTTP from 'express-graphql';
import { GraphQLSchema } from 'graphql';
import { importSchema } from 'graphql-import';
import { makeExecutableSchema } from 'graphql-tools';
import * as http from 'http';
import * as util from 'util';
import resolvers from './resolvers';

let app: express.Express;
let httpServer: http.Server;

export function startServer(schema: GraphQLSchema) {
  if (httpServer && httpServer.listening) {
    // Server is already started.
    return;
  }
  app = express();
  app.use('/graphql', graphqlHTTP({ schema, graphiql: true }));
  httpServer = app.listen(4000, () => console.log('Running a GraphQL API server at http://localhost:4000/graphql'));
}

export function stopServer() {
  if (!httpServer || !httpServer.listening) {
    // Server is not started.
    return;
  }
  httpServer.close();
}
