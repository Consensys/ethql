import Web3 = require('web3');
import { Erc165Service } from '..';

export class Web3Erc165Service implements Erc165Service {
  private static ABI = require(__dirname + '../../../../abi/erc165.json');

  constructor(private web3: Web3) {}

  public async supportsInterface(address, interfaceID: string): Promise<boolean> {
    const contract = new this.web3.eth.Contract(Web3Erc165Service.ABI, address);

    return contract.methods
      .supportsInterface(interfaceID)
      .call()
      .catch(() => false);
  }
}
