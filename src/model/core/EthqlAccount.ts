import { EthqlContext } from '../EthqlContext';
import EthqlStorage from './EthqlStorage';

/**
 * Account types.
 */
enum EthqlAccountType {
  CONTRACT = 'CONTRACT',
  EXTERNALLY_OWNED = 'EXTERNALLY_OWNED',
}

/**
 * Turns '0x' code into null.
 */
const nullifyIfEmpty = (code: string) => (!code || code === '0x' ? null : code);

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
    return this.address && web3.eth.getCode(this.address).then(nullifyIfEmpty);
  }

  public async transactionCount(_, { web3 }: EthqlContext) {
    return this.address && web3.eth.getTransactionCount(this.address);
  }

  public async storage(_) {
    return this.address && new EthqlStorage(this.address);
  }

  public async type(_, { web3 }: EthqlContext): Promise<EthqlAccountType> {
    if (!this.address) {
      return;
    }
    const code = await web3.eth.getCode(this.address).then(nullifyIfEmpty);
    return code ? EthqlAccountType.CONTRACT : EthqlAccountType.EXTERNALLY_OWNED;
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
