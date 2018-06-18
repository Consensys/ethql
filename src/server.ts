import * as cors from 'cors';
import * as express from 'express';
import * as graphqlHTTP from 'express-graphql';
import { GraphQLSchema } from 'graphql';
import * as http from 'http';
import { AddressInfo } from 'net';
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
    app.use(cors());
    app.use('/graphql', graphqlHTTP({ schema, rootValue: new EthqlQuery(), context, graphiql: true }));
    const { port } = context.config;
    httpServer = app.listen(port, () => {
      const { port } = getAddress();
      console.log(
        `Running a GraphQL API server at http://0.0.0.0:${port}/graphql (browse here: http://localhost:${port}/graphql)`,
      );
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

export function getAddress() {
  return httpServer && (httpServer.address() as AddressInfo);
}
