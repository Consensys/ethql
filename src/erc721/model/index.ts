import Contract from 'web3/eth/contract';
import { EthqlContext } from '../../context';
import { EthqlAccount } from '../../core/model';

export interface Erc721Transaction {
  tokenContract: Erc721TokenContract;
}

export interface Erc721SafeTransferFrom extends Erc721Transaction {
  from: Erc721TokenHolder;
  to: Erc721TokenHolder;
  tokenId: Long;
}

export interface Erc721TransferFrom extends Erc721Transaction {
  from: Erc721TokenHolder;
  to: Erc721TokenHolder;
  tokenId: Long;
}

export type ERC721TransferEvent = {
  from: Erc721TokenHolder;
  to: Erc721TokenHolder;
  tokenId: Long;
};

export type ERC721ApprovalEvent = {
  owner: Erc721TokenHolder;
  approved: Erc721TokenHolder;
  tokenId: Long;
};

export type ERC721ApprovalForAllEvent = {
  owner: Erc721TokenHolder;
  operator: Erc721TokenHolder;
  approved: Boolean;
};

export class Erc721TokenContract {
  private static ABI = require(__dirname + '../../../abi/erc721.json');
  private _contract: Contract;

  constructor(public readonly account: EthqlAccount, readonly context: EthqlContext) {
    this._contract = new context.services.web3.eth.Contract(Erc721TokenContract.ABI, account.address);
  }

  public async symbol() {
    return this._contract.methods
      .symbol()
      .call()
      .catch(() => undefined);
  }

  public async totalSupply() {
    return this._contract.methods
      .totalSupply()
      .call()
      .catch(() => undefined);
  }

  public async balanceOf({ address }: { address: string }) {
    return this._contract.methods
      .balanceOf(address)
      .call()
      .catch(() => undefined);
  }

  public async ownerOf({ tokenId }: { tokenId: string }) {
    return this._contract.methods
      .ownerOf(tokenId)
      .call()
      .catch(() => undefined);
  }
}

export class Erc721TokenHolder {
  constructor(public readonly account: EthqlAccount, private readonly contract: Erc721TokenContract) {}

  public async tokenBalance() {
    return this.contract.balanceOf({ ...this.account });
  }
}
