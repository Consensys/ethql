import { ApolloServer, ServerInfo } from 'apollo-server';
import { GraphQLSchema } from 'graphql';
import { EthqlContextFactory } from './model/EthqlContext';
import EthqlQuery from './model/EthqlQuery';
import { AddressInfo } from 'net';

let server: ApolloServer;
let info: AddressInfo

export async function startServer(schema: GraphQLSchema, ctxFactory: EthqlContextFactory) {
  server = new ApolloServer({
    schema,
    rootValue: new EthqlQuery(),
    context: ctxFactory.create(),
  });

  server.listen().then(({ url, address, family, port }) => {
    info = {address: address, family: family, port: Number(port)}
    console.log(`🚀 Server ready at ${url}, merry querying!`);
  });
}

export async function stopServer() {
  server.stop();
  info = null;
}

export function getInfo() {
  return info;
}
/*
import * as cors from 'cors';
import * as express from 'express';
import * as graphqlHTTP from 'express-graphql';
import { GraphQLSchema } from 'graphql';
import * as http from 'http';
import { AddressInfo } from 'net';
let app: express.Express;
let httpServer: http.Server;

export async function startServer(schema: GraphQLSchema, ctxFactory: EthqlContextFactory): Promise<{}> {
  if (httpServer && httpServer.listening) {
    // Server is already started.
    return Promise.resolve({});
  }

  // A function that returns the options for the GraphQL middleware for every incoming request.
  // Particularly we create a fresh context from the context factory.
  const optsFunc: graphqlHTTP.Options = (req, res) => ({
    schema,
    rootValue: new EthqlQuery(),
    context: ctxFactory.create(),
    graphiql: true,
  });

  return new Promise((resolve, reject) => {
    app = express();
    app.use(cors());
    app.use('/graphql', graphqlHTTP(optsFunc));

    const { port } = ctxFactory.config;
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
}*/
