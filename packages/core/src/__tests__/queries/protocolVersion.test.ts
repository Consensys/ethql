import { EthqlOptions, testGraphql } from '@ethql/plugin';
import { CORE_PLUGIN } from '../../plugin';

const testServerOpts: EthqlOptions = { plugins: [CORE_PLUGIN] };
const { execQuery } = testGraphql({opts: testServerOpts});

test('Get protocol version', async () => {
  const query = `{
    protocolVersion
  }`;

  let result = await execQuery(query);

  expect(result.data).not.toBeNull();
  expect(result.data.protocolVersion).toBeGreaterThan(60);
});