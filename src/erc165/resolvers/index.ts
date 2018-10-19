import { EthqlContext } from '../../context';
import { EthqlAccount } from '../../core/model';

async function supportsInterface(account: EthqlAccount, { interfaceID }, context: EthqlContext) {
  const ABI = require(__dirname + '../../../abi/erc165.json');
  const contract = new context.services.web3.eth.Contract(ABI, account.address);

  return contract.methods
    .supportsInterface(interfaceID)
    .call()
    .catch(console.error);
}

export default {
  Account: {
    supportsInterface,
  },
};
