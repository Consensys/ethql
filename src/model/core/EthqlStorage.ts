import Web3 = require('web3');
import { EthqlContext } from '../EthqlContext';

interface PathObject {
  storageType: string;
  query: string;
}

class EthqlStorage {
  public address: string;
  public path: PathObject[];
  public base: string;
  public previousType: string;

  constructor(address: string) {
    this.address = address;
    this.path = [];
    this.base = '';
    this.previousType = '';
  }

  public solidityMap(args) {
    if (args.keyType.toLowerCase() === 'address') {
      this.addToPath(args.at, 'addressMap');
    } else if (args.keyType.toLowerCase() === 'string') {
      this.addToPath(args.at, 'stringMap');
    } else {
      this.addToPath(args.at, 'numberMap');
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
    this.addToPath(args.at.toString(), 'value');

    for (let step of this.path) {
      this.base = this.newBase(step, web3);
    }

    return web3.eth.getStorageAt(this.address, this.base);
  }

  private pad(val, web3: Web3) {
    let rtn = web3.utils.toHex(val);
    rtn = web3.utils.leftPad(rtn, 64, '0');
    return rtn.slice(2);
  }

  private addToPath(query: string, type: string) {
    if (this.base === '') {
      this.base = query;
    } else {
      this.path.push({ storageType: this.previousType, query });
    }

    this.previousType = type;
  }

  private newBase(step: PathObject, web3: Web3) {
    if (step.storageType === 'numberMap' || step.storageType === 'addressMap') {
      return web3.utils.sha3('0x' + this.pad(step.query, web3) + this.pad(this.base, web3));
    } else if (step.storageType === 'stringMap') {
      return web3.utils.sha3(web3.utils.toHex(step.query) + this.pad(this.base, web3));
    } else if (step.storageType === 'fixedArray') {
      return web3.utils.toHex(web3.utils.toBN(this.base).add(web3.utils.toBN(step.query)));
    } else {
      return web3.utils.toHex(
        web3.utils.toBN(web3.utils.sha3('0x' + this.pad(this.base, web3))).add(web3.utils.toBN(step.query)),
      );
    }
  }
}

export default EthqlStorage;
