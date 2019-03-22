import { EthqlOptions, testGraphql } from '@ethql/plugin';
import { AbiCoder } from 'web3-eth-abi';
import { AbiType } from 'web3-utils';
import { CORE_PLUGIN } from '../../plugin';

const testServerOpts: EthqlOptions = { plugins: [CORE_PLUGIN] };
const { execQuery } = testGraphql({opts: testServerOpts});

const OMISEGO_ADDRESS = '0xd26114cd6EE289AccF82350c8d8487fedB8A0C07';

test('block: basic call', async () => {
  const abiCoder = new AbiCoder();
  const symbolAbi = {
    constant: true,
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', type: 'string' }],
    payable: false,
    type: 'function' as AbiType
  };
  let encodedFn = abiCoder.encodeFunctionCall(symbolAbi, []);
  console.log(encodedFn);
  const query = `{
    block {
      call(data: {
        to: "${OMISEGO_ADDRESS}",
        gas: 200000,
        gasPrice: "20000",
        data: "${encodedFn}"
      }) {
        data
      }
    }
  }
  `;

  const expected =  { block:
  { call:
     { data: '0x000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000034f4d470000000000000000000000000000000000000000000000000000000000' } } };

  let result = await execQuery(query);
  let decodedResult = abiCoder.decodeParameter('string', result.data.block.call.data)

  expect(result.data).toBeDefined();
  expect(result.data).toEqual(expected);
  expect(decodedResult).toBe('OMG');
});

