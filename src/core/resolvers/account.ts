import { EthqlContext } from '../../context';
import { EthqlAccount, EthqlAccountType, StorageAccessor } from '../model';

import Web3 = require('web3');

async function balance(obj: EthqlAccount, { unit } /* args */, { ethService }: EthqlContext) {
  const bal = await ethService.fetchBalance(obj);
  return unit ? Web3.utils.fromWei(bal, unit) : bal;
}

async function code(obj: EthqlAccount, args, { ethService }: EthqlContext): Promise<string> {
  return ethService.fetchCode(obj);
}

async function transactionCount(obj: EthqlAccount, args, { ethService }: EthqlContext): Promise<number> {
  return ethService.fetchTransactionCount(obj);
}

function storage({ address }: EthqlAccount, args): StorageAccessor {
  return address && new StorageAccessor(address);
}

async function type(obj: EthqlAccount, args, { ethService }: EthqlContext): Promise<EthqlAccountType> {
  const code = await ethService.fetchCode(obj);
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
