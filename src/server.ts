import { ApolloServer } from 'apollo-server';
import { GraphQLSchema } from 'graphql';
import { AddressInfo } from 'net';
import { EthqlContextFactory } from './model/EthqlContext';
import EthqlQuery from './model/EthqlQuery';

let server: ApolloServer;
let info: AddressInfo;

export async function startServer(schema: GraphQLSchema, ctxFactory: EthqlContextFactory) {
  if (!server) {
    server = new ApolloServer({
      schema,
      rootValue: new EthqlQuery(),
      context: ctxFactory.create(),
    });
  }

  const { port } = ctxFactory.config;
  await server.listen(port).then(({ url, address, family, port }) => {
    info = { address, family, port: Number(port) };
    console.log(`🚀 Server ready at ${url}, merry querying!`);
  });
}

export async function stopServer() {
  if (server) {
    await server.stop();
    info = null;
    server = null;
  }
}

export function getInfo() {
  return info;
}
