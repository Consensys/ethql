import { EthqlContext } from '../../context';
import { EthqlAccount, EthqlAccountType, StorageAccessor } from '../../core/model';
import { Erc721TokenContract } from '../model';

async function nftToken(obj: EthqlAccount, { address }, context: EthqlContext) {
  if (
    (await context.services.erc165Service.supportsInterface(address, '0x9a20483d')) ||
    (await context.services.erc165Service.supportsInterface(address, '0x80ac58cd'))
  ) {
    return new Erc721TokenContract(new EthqlAccount(address), context);
  }
}

export default {
  Query: {
    nftToken,
  },
};
