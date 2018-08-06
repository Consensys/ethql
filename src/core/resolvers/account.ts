import { EthqlContext } from '../../context';
import { EthqlAccount, EthqlAccountType, StorageAccessor } from '../model';

/**
 * Turns '0x' code into null.
 */
const nullifyIfEmpty = (code: string) => (!code || code === '0x' ? null : code);

async function balance({ address }: EthqlAccount, { unit }, { web3 }: EthqlContext) {
  if (!address) {
    return null;
  }
  const bal = await web3.eth.getBalance(address);
  return unit ? web3.utils.fromWei(bal, unit) : bal;
}

async function code({ address }: EthqlAccount, _, { web3 }: EthqlContext): Promise<string> {
  return address && web3.eth.getCode(address).then(nullifyIfEmpty);
}

async function transactionCount({ address }: EthqlAccount, _, { web3 }: EthqlContext): Promise<number> {
  return address && web3.eth.getTransactionCount(address);
}

function storage({ address }: EthqlAccount, _): StorageAccessor {
  return address && new StorageAccessor(address);
}

async function type(obj: EthqlAccount, _, { web3 }: EthqlContext): Promise<EthqlAccountType> {
  if (!obj.address) {
    return;
  }
  const code = await web3.eth.getCode(obj.address).then(nullifyIfEmpty);
  return code ? EthqlAccountType.CONTRACT : EthqlAccountType.EXTERNALLY_OWNED;
}

export default {
  Account: {
    balance,
    code,
    transactionCount,
    storage,
    type,
  },
};
