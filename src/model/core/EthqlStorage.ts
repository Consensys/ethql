import Web3 = require('web3');

interface pathObject {
  storageType: string;
  storageDetail: string;
  query: string;
}

class EthqlStorage {
  address: string;
  web3: Web3;
  path: Array<pathObject> = [];

  constructor(address: string, web3: Web3) {
    this.address = address;
    this.web3 = web3;
  }

  private pad (val) {
    let rtn = this.web3.utils.toHex(val);
    rtn = this.web3.utils.leftPad(rtn, 64, '0');
    return rtn.slice(2);
  }

  public solidityMap(args) {
    if(args.isNumericalKey) {
      this.path.push({storageType: 'mapping', storageDetail: 'numericalKey', query: args.at.toString()})
    } else {
      this.path.push({storageType: 'mapping', storageDetail: 'stringKey', query: args.at.toString()})
    }
    
    return this
  }

  public solidityList(args) {
    if (args.isDynamic) {
      this.path.push({storageType: 'list', storageDetail: 'dynamic', query: args.at.toString()});
    } else {
      this.path.push({storageType: 'list', storageDetail: 'fixed', query: args.at.toString()});
    }
    
    return this;
  }


  public async value(args): Promise<string> {
    const previousQuery = this.path.slice(-1)[0];
    this.path.push({storageType: previousQuery.storageType, storageDetail: previousQuery.storageDetail, query: args.at.toString()});

    let base = '';
    //for(___ of ____)
    for (let step of this.path) {
      base = this.newBase(base, step);
    }

    const stor = await this.web3.eth.getStorageAt(this.address, base);
    return stor;
  }

  public newBase(base: string, step: pathObject) {
    let rtn = '';
    if (base === '') {
      rtn = step.query;
    } else {
      if (step.storageType === 'mapping') {
        if (step.storageDetail === 'numericalKey') {
          rtn = this.web3.utils.sha3('0x' + this.pad(step.query) + this.pad(base));
        } else {
          rtn = this.web3.utils.sha3(this.web3.utils.toHex(step.query) + this.pad(base));
        }
      } else {
        if (step.storageDetail === 'dynamic') {
          rtn = this.web3.utils.toHex(this.web3.utils.toBN(this.web3.utils.sha3('0x' + this.pad(base))).add(this.web3.utils.toBN(step.query)))
        } else {
          rtn = this.web3.utils.toHex(this.web3.utils.toBN(base).add(this.web3.utils.toBN(step.query)));
        }
      }
    }
    
    return rtn;
  }
}

export default EthqlStorage;
