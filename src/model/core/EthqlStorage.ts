import Web3 = require('web3');
import EthqlContext from '../EthqlContext';

interface PathObject {
  storageType: string;
  isNumKey: boolean;
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
    if (this.base === '') {
      this.base = args.at.toString();
    } else {
      this.path.push({ storageType: 'mapping', isNumKey: args.isNumKey, query: args.at.toString() });
    }

    this.previousType = 'mapping';
    return this;
  }

  public solidityFixedArray(args) {
    if (this.base === '') {
      this.base = args.at.toString();
    } else {
      this.path.push({ storageType: 'fixedArray', isNumKey: args.isNumKey, query: args.at.toString() });
    }

    this.previousType = 'fixedArray';
    return this;
  }

  public solidityDynamicArray(args) {
    if (this.base === '') {
      this.base = args.at.toString();
    } else {
      this.path.push({ storageType: 'dynamicArray', isNumKey: args.isNumKey, query: args.at.toString() });
    }

    this.previousType = 'dynamicArray';
    return this;
  }

  public async value(args, { web3 }: EthqlContext): Promise<string> {
    if (this.previousType === 'mapping') {
      this.solidityMap(args);
    } else if (this.previousType === 'fixedArray') {
      this.solidityFixedArray(args);
    } else {
      this.solidityDynamicArray(args);
    }

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

  private newBase(step: PathObject, web3: Web3) {
    if (typeof step.isNumKey !== 'undefined') {
      if (step.isNumKey) {
        return web3.utils.sha3('0x' + this.pad(step.query, web3) + this.pad(this.base, web3));
      } else {
        return web3.utils.sha3(web3.utils.toHex(step.query) + this.pad(this.base, web3));
      }
    } else {
      if (step.storageType === 'fixedArray') {
        return web3.utils.toHex(web3.utils.toBN(this.base).add(web3.utils.toBN(step.query)));
      } else {
        return web3.utils.toHex(
          web3.utils.toBN(web3.utils.sha3('0x' + this.pad(this.base, web3))).add(web3.utils.toBN(step.query)),
        );
      }
    }
  }
}

export default EthqlStorage;
