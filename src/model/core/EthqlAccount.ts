import BigNumber = require('bn.js');
import { EthqlContext } from '../EthqlContext';
import EthqlStorage from './EthqlStorage';

class EthqlAccount {
  constructor(public address: string) {}

  public async balance({ unit }, { web3 }: EthqlContext) {
    if (!this.address) {
      return null;
    }
    const bal = await web3.eth.getBalance(this.address);
    return unit ? web3.utils.fromWei(bal, unit) : bal;
  }

  public async code(_, { web3 }: EthqlContext) {
    return this.address && web3.eth.getCode(this.address);
  }

  public async transactionCount(_, { web3 }: EthqlContext) {
    return this.address && web3.eth.getTransactionCount(this.address);
  }

  public async storage(_) {
    return this.address && new EthqlStorage(this.address);
  }

  public async supportsInterface(args, { web3 }: EthqlContext) {
    // Calculates interface signature
    let argsInterface = new BigNumber(0);
    for (let selector of args.selectors) {
      argsInterface = argsInterface.xor(new BigNumber(Number(await web3.eth.abi.encodeFunctionSignature(selector))));
    }

    if (
      //Checks if contract supports ERC-165 by attempting to call "supportsInterface()"
      [NaN, 0].includes(Number(await web3.eth.call({ to: this.address, data: '0x01ffc9a701ffc9a7' }))) ||
      [NaN, 1].includes(Number(await web3.eth.call({ to: this.address, data: '0x01ffc9a7ffffffff' })))
    ) {
      return 'NON_INTROSPECTABLE';
    } else {
      if (Number(await web3.eth.call({ to: this.address, data: '0x01ffc9a7' + argsInterface.toString(16) }))) {
        return 'SUPPORTED';
      } else {
        return 'NOT_SUPPORTED';
      }
    }
  }

  public equals(addressOrAccount: string | EthqlAccount) {
    // Fail soon if any of the addresses is null, which could stand for contract creation.
    if (!this.address || !addressOrAccount) {
      return false;
    }
    const address = typeof addressOrAccount === 'string' ? addressOrAccount : addressOrAccount.address;
    return this.address.toLowerCase() === address.toLowerCase();
  }
}

export default EthqlAccount;
