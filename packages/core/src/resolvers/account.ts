import { EthqlContext } from '@ethql/base';
import { EthqlAccount, EthqlAccountType, StorageAccessor } from '../model';

import Web3 = require('web3');

async function balance(obj: EthqlAccount, { unit } /* args */, { services: { eth } }: EthqlContext) {
  const bal = await eth.fetchBalance(obj);
  return unit ? Web3.utils.fromWei(bal, unit) : bal;
}

async function code(obj: EthqlAccount, args, { services: { eth } }: EthqlContext): Promise<string> {
  return eth.fetchCode(obj);
}

async function transactionCount(obj: EthqlAccount, args, { services: { eth } }: EthqlContext): Promise<number> {
  return eth.fetchTransactionCount(obj);
}

function storage({ address }: EthqlAccount, args): StorageAccessor {
  return address && new StorageAccessor(address);
}

async function type(obj: EthqlAccount, args, { services: { eth } }: EthqlContext): Promise<EthqlAccountType> {
  const code = await eth.fetchCode(obj);
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
