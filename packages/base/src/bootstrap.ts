import { GraphQLSchema } from 'graphql';
import { Options } from './config';
import { EthqlServiceDefinitions, EthqlServiceFactories } from './services';

export type EthqlBootstrapResult = {
  config: Options;
  schema: GraphQLSchema;
  serviceDefinitions: EthqlServiceDefinitions;
  serviceFactories: EthqlServiceFactories;
};
