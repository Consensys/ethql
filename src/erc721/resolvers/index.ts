import { EthqlContext } from '../../context';
import { EthqlAccount, EthqlAccountType, StorageAccessor } from '../../core/model';
import { Erc721TokenContract } from '../model';

const interfaceId = {
  erc721: '0x80ac58cd',
  cryptoKitities: '0x9a20483d',
};

async function nftToken(account: EthqlAccount, args, context: EthqlContext) {
  const { address } = account;
  if (
    (await context.services.erc165Service.supportsInterface(address, interfaceId.cryptoKitities)) ||
    (await context.services.erc165Service.supportsInterface(address, interfaceId.erc721))
  ) {
    return new Erc721TokenContract(new EthqlAccount(address), context);
  }
}

export default {
  Account: {
    nftToken,
  },
};
