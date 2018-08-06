import { ApolloServer, PlaygroundConfig } from 'apollo-server';
import { GraphQLSchema } from 'graphql';
import { AddressInfo } from 'net';
import { EthqlContextFactory } from './context';
import { WELCOME_QUERY } from './editor';

const playground: PlaygroundConfig = {
  settings: { 'editor.theme': 'light' },
  tabs: [
    {
      endpoint: '/',
      query: WELCOME_QUERY,
    },
  ],
};

type ServerStatus = 'stopped' | 'starting' | 'started' | 'stopping';

/**
 * Options for EthQL server.
 */
export type EthqlServerOpts = {
  schema: GraphQLSchema;
  ctxFactory: EthqlContextFactory;
} & {
  [prop: string]: any;
};

/**
 * Represents an EthQL server currently using an Apollo Server as its backing implementation.
 * In the future, this class could be made abstract or extracted to an interface if polymorphic
 * server support is required.
 */
export class EthqlServer {
  private server: ApolloServer;
  private _address: AddressInfo;
  private _status: ServerStatus = 'stopped';

  constructor(private opts: EthqlServerOpts) {}

  public async start() {
    if (this._status !== 'stopped') {
      throw new Error(`Illegal EthQL server state upon start(). Expected status: stopped; actual: ${this._status}`);
    }

    this._status = 'starting';

    const server = new ApolloServer({
      schema: this.opts.schema,
      rootValue: {},
      context: () => this.opts.ctxFactory.create(),
      playground,
    });

    const { url, address, family, port } = await server.listen(this.opts.ctxFactory.config.port);
    this.server = server;
    this._address = { address, family, port: Number(port) };
    this._status = 'started';

    console.log(`🚀  Running a GraphQL API server at ${url}\nMerry querying!`);
  }

  public async stop() {
    if (this._status !== 'started') {
      throw new Error(`Illegal EthQL server state upon stop(). Expected status: started; actual: ${this._status}`);
    }

    this._status = 'stopping';

    await this.server.stop();
    this._address = this._status = this.server = null;
    this._status = 'stopped';
  }

  public get address() {
    return this._address;
  }

  public get status() {
    return this._status;
  }
}
