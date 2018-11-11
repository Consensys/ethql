import { EthqlContext } from '../../context';
import { EthqlAccount } from '../../core/model';

async function supportsInterface(account: EthqlAccount, { interfaceID }, context: EthqlContext) {
  const ABI = require(__dirname + '../../../abi/erc165.json');
  return context.services.erc165Service.supportsInterface(account.address, interfaceID);
}

export default {
  Account: {
    supportsInterface,
  },
};
