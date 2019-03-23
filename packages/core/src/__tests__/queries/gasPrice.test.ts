import { EthqlOptions, testGraphql } from '@ethql/plugin';
import { CORE_PLUGIN } from '../../plugin';

const testServerOpts: EthqlOptions = { plugins: [CORE_PLUGIN] };
const { execQuery } = testGraphql({opts: testServerOpts});

test('GasPrice: returns a valid gasPrice', async () => {
  const query = `{
    gasPrice
  }`;

  let result = await execQuery(query);
  expect(result.data).toBeDefined();
  expect(result.data).not.toBeNull();
  expect(result.data.gasPrice).toBeGreaterThan(1);
});
