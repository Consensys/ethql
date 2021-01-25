import { EthqlOptions, testGraphql } from '@ethql/plugin';
import { AbiCoder } from 'web3-eth-abi';
import { AbiType } from 'web3-utils';
import { CORE_PLUGIN } from '../../plugin';

const testServerOpts: EthqlOptions = { plugins: [CORE_PLUGIN] };
const { execQuery } = testGraphql({opts: testServerOpts});
const abiCoder = new AbiCoder();

const OMISEGO_ADDRESS = '0xd26114cd6EE289AccF82350c8d8487fedB8A0C07';

const encodedFn = abiCoder.encodeFunctionCall({
  constant: false,
  inputs: [{ 'name': 'to', 'type': 'address' }, { 'name': 'value', 'type': 'uint256' }],
  name: 'transfer',
  outputs: [{ 'name': '', 'type': 'bool' }],
  payable: false,
  type: 'function' as AbiType
}, [OMISEGO_ADDRESS, '20']);

describe('EstimateGas: Happy paths', () => {
  const expected = { data: { estimateGas: 36774 } };
  test('A full query returns valid data', async () => {
    const query = `{
      estimateGas(data: {
        to: "${OMISEGO_ADDRESS}",
        gas: 20000,
        gasPrice: "20000",
        data: "${encodedFn}",
        value: 0
      })
    }`;

    let result = await execQuery(query);
    expect(result).toEqual(expected);
  });

  test('Missing gas returns valid data', async () => {
    const query = `{
      estimateGas(data: {
        to: "${OMISEGO_ADDRESS}",
        data: "${encodedFn}",
        value: 0
      })
    }`;

    let result = await execQuery(query);
    expect(result).toEqual(expected);
  });
});

describe('EstimateGas: Error States', () => {
  const invalidAddressErr = 'A valid contract address is required.';
  const missingData = 'Parameter (data): missing or not hex encoded.';

  test('A missing address returns errros', async () => {
    const query = `{
      estimateGas(data: {
        gas: 20000,
        gasPrice: "20000",
        data: "${encodedFn}",
        value: 0
      })
    }`;

    // Handled by the resolver because this by passes the scalar validation.
    let result = await execQuery(query);
    expect(result.data).toBeNull();
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].message).toEqual(invalidAddressErr);
  });

  test('A bad address returns errors', async () => {
    const query = `{
      estimateGas(data: {
        to: "0x123abc",
        gas: 20000,
        gasPrice: "20000",
        data: "${encodedFn}",
        value: 0
      })
    }`;

    let result = await execQuery(query);

    // Error state is slightly different since the Address scalar intercepts this validation.
    expect(result.data).toBeUndefined();
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].message).toEqual('Expected type Address, found "0x123abc".');
  });

  test('Missing data returns errors', async () => {
    const query = `{
      estimateGas(data: {
        to: "${OMISEGO_ADDRESS}",
        gas: 20000,
        gasPrice: "20000",
        value: 0
      })
    }`;

    let result = await execQuery(query);

    expect(result.data).toBeNull();
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].message).toEqual(missingData);
  });

  test('Unencoded data returns errors', async () => {
    const query = `{
      estimateGas(data: {
        to: "${OMISEGO_ADDRESS}",
        gas: 20000,
        gasPrice: "20000",
        data: "transfer('0x0123', '20')",
        value: 0
      })
    }`;

    let result = await execQuery(query);

    expect(result.data).toBeNull();
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].message).toEqual(missingData);
  });
});