import core from '../core';
import { EthqlPluginFactory } from '../plugin';
import { testGraphql } from './utils';

test('plugins: plugin resolvers are used', async () => {
  const testPlugin: EthqlPluginFactory = () => ({
    name: 'test-plugin',
    priority: 1000,
    schema: [
      `extend type Query {
      test: String
    }`,
    ],
    resolvers: {
      Query: {
        test: () => 'testReply',
      },
    },
  });

  const { execQuery } = testGraphql({ optsOverride: { plugins: [core, testPlugin] } });
  const resp = await execQuery(`
  {
    test
  }`);

  expect(resp.data.test).toEqual('testReply');
});
