import Web3 = require('web3');
import { EthqlContext } from '../EthqlContext';

interface PathObject {
  query: string;
  storageType: 'addressMap' | 'numberMap' | 'stringMap' | 'fixedArray' | 'dynamicArray';
}

/**
 * As the query is parsed, the resolvers are called if their type of storage is requested.
 * When called, they pass their storage type and the query attribtue (args.at) to addToPath and return this.
 * If base is null, addToPath will set base to the attribute.
 * If base is not null, the attribute and previous storage type (because attribute is always referencing the previous storage) are added to path
 * Then addToPath will update previousType to the storage type that was passed.
 * When a value call comes through, the value function runs through the path and compiles the required base using the newBase function.
 * newBase figures out the storage location of one step using the previous base and the query attribute.
 * It then tacks on the final attribute (from value) and calculates the final base.
 * This final base and the address of the contract is then given to web3 which returns the data at that location.
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

  //Resolvers relay the storage type of the query and its attributes to the addToPath function.
  //addToPath pushes the query attribute and the type storage it is referencing to the path instance

  //Checks which keyType has been passed and then sends that to addToPath, if none match then TypeError is thrown
  //keyTypes supported: 'address', 'string', 'number'
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

  public solidityFixedArray(args) {
    this.addToPath(args.at.toString(), 'fixedArray');
    return this;
  }

  public solidityDynamicArray(args) {
    this.addToPath(args.at.toString(), 'dynamicArray');
    return this;
  }

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

  //Depending on the storage type, solidity stores it in different locations
  //These are the methods for the supported types
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
