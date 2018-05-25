import * as graphqlHTTP from 'express-graphql';
import { GraphQLSchema } from 'graphql';

import * as express from 'express';

let app : express.Application;

export function startServer(schema: GraphQLSchema) {
    if (app) {
      return;
    }
    app = express();
    app.use('/graphql', graphqlHTTP({ schema, graphiql: true }));
    app.listen(4000);
    console.log('Running a GraphQL API server at http://localhost:4000/graphql');
}