import Web3 = require('web3');
import { EthqlContext } from '../EthqlContext';

interface PathObject {
  query: string;
  storageType: 'addressMap' | 'numberMap' | 'stringMap' | 'fixedArray' | 'dynamicArray';
}

/**
 * Provides fluent accessors for solidity contract storage. Four data types are supported:
 * Dynamic arrays, fixed arrays, maps with string keys, and maps with numeric keys.
 * The algorithm to calculate the storage key varies for each data type.
 */
class EthqlStorage {
  private address: string;
  private base: string;
  private path: PathObject[];
  private previousType: 'addressMap' | 'numberMap' | 'stringMap' | 'fixedArray' | 'dynamicArray';

  constructor(address: string) {
    this.address = address;
    this.base = null;
    this.path = [];
    this.previousType = null;
  }

  /**
   * Adds the previous type of storage and the current query to path.
   * The previous type of storage is used as the query always refers to a storage location in the storage above it.
   * At a value call, the cumulative query is calculated using a different algorithm for each storage type:
   * For a number or address map, the algorithm is: sha3('0x' + pad(query) + pad(base)).
   * For a string map, the algorithm is: sha3(toHex(query) + pad(base)).
   */
  public solidityMap(args) {
    if (args.keyType.toLowerCase() === 'address') {
      this.addToPath(args.at, 'addressMap');
    } else if (args.keyType.toLowerCase() === 'number') {
      this.addToPath(args.at, 'numberMap');
    } else if (args.keyType.toLowerCase() === 'string') {
      this.addToPath(args.at, 'stringMap');
    } else {
      throw new TypeError('Not a supported keyType');
    }

    return this;
  }

  /**
   * Adds the previous type of storage and the current query to path.
   * The algorithm for finding the new base is: toHex(base added (not concatenated) to query).
   */
  public solidityFixedArray(args) {
    this.addToPath(args.at.toString(), 'fixedArray');
    return this;
  }

  /**
   * Adds the previous type of storage and the current query to path.
   * The algorithm for finding the new base is: toHex(sha3('0x' + pad(base))) added (not concatenated) to query).
   */
  public solidityDynamicArray(args) {
    this.addToPath(args.at.toString(), 'dynamicArray');
    return this;
  }

  /**
   * Compiles the cumulative query from the path and value query and returns the contract's storage at that location.
   */
  public async value(args, { web3 }: EthqlContext): Promise<string> {
    let tempBase = this.base;
    for (let step of this.path) {
      tempBase = this.newBase(step, tempBase, web3);
    }

    const valueCall = { query: args.at.toString(), storageType: this.previousType };
    const rtn = this.newBase(valueCall, tempBase, web3);

    return web3.eth.getStorageAt(this.address, rtn);
  }

  private pad(val, web3: Web3) {
    let rtn = web3.utils.toHex(val);
    rtn = web3.utils.leftPad(rtn, 64, '0');
    return rtn.slice(2);
  }

  private addToPath(query: string, type: 'addressMap' | 'numberMap' | 'stringMap' | 'fixedArray' | 'dynamicArray') {
    if (this.base === null) {
      this.base = query;
    } else {
      this.path.push({ query, storageType: this.previousType });
    }

    this.previousType = type;
  }

  private newBase(step: PathObject, tempBase: string, web3: Web3) {
    if (step.storageType === 'numberMap' || step.storageType === 'addressMap') {
      return web3.utils.sha3('0x' + this.pad(step.query, web3) + this.pad(tempBase, web3));
    } else if (step.storageType === 'stringMap') {
      return web3.utils.sha3(web3.utils.toHex(step.query) + this.pad(tempBase, web3));
    } else if (step.storageType === 'fixedArray') {
      return web3.utils.toHex(web3.utils.toBN(tempBase).add(web3.utils.toBN(step.query)));
    } else if (step.storageType === 'dynamicArray') {
      return web3.utils.toHex(
        web3.utils.toBN(web3.utils.sha3('0x' + this.pad(tempBase, web3))).add(web3.utils.toBN(step.query)),
      );
    }
  }
}

export default EthqlStorage;
