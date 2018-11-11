import core from '../../core';
import erc165 from '../../erc165';
import { testGraphql } from '../utils';

const { execQuery } = testGraphql({ optsOverride: { plugins: [core, erc165] } });

test('erc165: Cryptokities supports ERC165 interface', async () => {
  const query = `
    {
    	account(address:"0x06012c8cf97BEaD5deAe237070F9587f8E7A266d") {
        supportsInterface(interfaceID: "0x01ffc9a7")
      }
    }
  `;

  const result = await execQuery(query);
  expect(result.errors).toBeUndefined();
  expect(result.data).not.toBeUndefined();
  expect(result.data.account.supportsInterface).toEqual(true);
});

test('erc165: Cryptokities supports ERC721 interface', async () => {
  const query = `
    {
    	account(address:"0x06012c8cf97BEaD5deAe237070F9587f8E7A266d") {
        supportsInterface(interfaceID: "0x9a20483d")
      }
    }
  `;

  const result = await execQuery(query);
  expect(result.errors).toBeUndefined();
  expect(result.data).not.toBeUndefined();

  expect(result.data.account.supportsInterface).toEqual(true);
});

test('erc165: OmiseGO does not supports ERC165', async () => {
  const query = `
    {
    	account(address:"0xd26114cd6EE289AccF82350c8d8487fedB8A0C07") {
        address,
        supportsInterface(interfaceID: "0x01ffc9a7")
      }
    }
  `;

  const result = await execQuery(query);
  expect(result.errors).toBeUndefined();
  expect(result.data).not.toBeUndefined();

  expect(result.data.account.supportsInterface).toEqual(false);
});
