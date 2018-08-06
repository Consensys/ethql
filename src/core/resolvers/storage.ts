import { EthqlContext } from '../../context';
import { StorageAccessor, StorageAccessorElement, StorageMapKeyType, StorageObjectType } from '../model';

import Web3 = require('web3');
const { toHex, leftPad, sha3, toBN } = Web3.utils;

const pad64 = val => leftPad(toHex(val), 64, '0').slice(2);

function computeSlot({ selector }: StorageAccessorElement, base: string, prevType?: StorageObjectType): string {
  if (prevType === null || !base) {
    return selector;
  }

  switch (prevType) {
    case StorageObjectType.MAP_NUMBER_KEY:
    case StorageObjectType.MAP_ADDRESS_KEY:
      return sha3('0x' + pad64(selector) + pad64(base));
    case StorageObjectType.MAP_STRING_KEY:
      return sha3(toHex(selector) + pad64(base));
    case StorageObjectType.ARRAY_FIXED:
      return toHex(toBN(base).add(toBN(selector)));
    case StorageObjectType.ARRAY_DYNAMIC:
      return toHex(toBN(sha3('0x' + pad64(base))).add(toBN(selector)));
  }
}

/**
 * Adds the previous type of storage and the current query to path.
 * The algorithm for finding the new base is: toHex(base added (not concatenated) to query).
 */
function solidityFixedArray(obj: StorageAccessor, { at: selector }): StorageAccessor {
  return obj.push({ selector, type: StorageObjectType.ARRAY_FIXED });
}

/**
 * Adds the previous type of storage and the current query to path.
 * The algorithm for finding the new base is: toHex(sha3('0x' + pad(base))) added (not concatenated) to query).
 */
function solidityDynamicArray(obj: StorageAccessor, { at: selector }): StorageAccessor {
  return obj.push({ selector, type: StorageObjectType.ARRAY_DYNAMIC });
}

/**
 * Adds the previous type of storage and the current query to path.
 * The previous type of storage is used as the query always refers to a storage location in the storage above it.
 * At a value call, the cumulative query is calculated using a different algorithm for each storage type:
 * For a number or address map, the algorithm is: sha3('0x' + pad(query) + pad(base)).
 * For a string map, the algorithm is: sha3(toHex(query) + pad(base)).
 */
function solidityMap(
  obj: StorageAccessor,
  { keyType, at: selector }: { keyType: StorageMapKeyType; at: string },
): StorageAccessor {
  const mappings: { [P in StorageMapKeyType]: StorageObjectType } = {
    address: StorageObjectType.MAP_ADDRESS_KEY,
    number: StorageObjectType.MAP_NUMBER_KEY,
    string: StorageObjectType.MAP_STRING_KEY,
  };

  return obj.push({ selector, type: mappings[keyType] });
}

/**
 * Compiles the cumulative query from the path and value query and returns the contract's storage at that location.
 */
async function value({ address, path }: StorageAccessor, { at: selector }, { web3 }: EthqlContext): Promise<string> {
  if (!address) {
    return;
  }
  const accessor = path.push({ selector, type: null });
  const reducer = (acc, curr) => ({ base: computeSlot(curr, acc.base, acc.prevType), prevType: curr.type });
  const { base: loc } = accessor.reduce(reducer, { base: null, prevType: null });
  return web3.eth.getStorageAt(address, loc);
}

const resolvers = {
  value,
  solidityFixedArray,
  solidityDynamicArray,
  solidityMap,
};

export default {
  Storage: resolvers,
  SolidityFixedArray: resolvers,
  SolidityDynamicArray: resolvers,
  SolidityMap: resolvers,
};
