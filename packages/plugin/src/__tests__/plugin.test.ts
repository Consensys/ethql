import { EthqlPluginFactory } from '..';
import { testGraphql } from '../test-utils';

test('plugins: plugin resolvers are used', async () => {
  const schema = `
  extend type Query {
    test: String
  }`;

  const testPlugin: EthqlPluginFactory = () => ({
    name: 'test-plugin',
    priority: 1000,
    schema: [schema],
    resolvers: {
      Query: {
        test: () => 'testReply',
      },
    },
  });

  const { execQuery } = testGraphql({
    opts: { plugins: [testPlugin], config: { validation: { ignoreCorePluginAbsent: true } } },
  });
  const resp = await execQuery(`
  {
    test
  }`);

  expect(resp.data.test).toEqual('testReply');
});
