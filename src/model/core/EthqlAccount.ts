import EthqlContext from '../EthqlContext';

class EthqlAccount {
  constructor(public address: string) {}

  public async balance({ unit }, { web3 }: EthqlContext) {
    return web3.eth.getBalance(this.address);
  }

  public async code(_, { web3 }: EthqlContext) {
    return web3.eth.getCode(this.address);
  }

  public async transactionCount(_, { web3 }: EthqlContext) {
    return web3.eth.getTransactionCount(this.address);
  }
}

export default EthqlAccount;
