import EthqlContext from '../EthqlContext';

class EthqlAccount {
  constructor(public address: string) {}

  public async balance({ unit }, { web3 }: EthqlContext) {
    return this.address && web3.eth.getBalance(this.address);
  }

  public async code(_, { web3 }: EthqlContext) {
    return this.address && web3.eth.getCode(this.address);
  }

  public async transactionCount(_, { web3 }: EthqlContext) {
    return this.address && web3.eth.getTransactionCount(this.address);
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
