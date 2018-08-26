import { Contract } from 'web3/types';
import { EthqlContext } from '../../context';
import { EthqlAccount } from '../../core/model';

export interface Erc20Transaction {
  tokenContract: Erc20TokenContract;
}

export interface Erc20Transfer extends Erc20Transaction {
  from: Erc20TokenHolder;
  to: Erc20TokenHolder;
  value: string;
}

export interface Erc20Approve extends Erc20Transaction {
  from: Erc20TokenHolder;
  spender: Erc20TokenHolder;
  value: string;
}

export interface Erc20TransferFrom extends Erc20Transaction {
  from: Erc20TokenHolder;
  to: Erc20TokenHolder;
  spender: Erc20TokenHolder;
  value: string;
}

export type ERC20TransferEvent = {
  from: Erc20TokenHolder;
  to: Erc20TokenHolder;
  value: string;
};

export type ERC20ApprovalEvent = {
  owner: Erc20TokenHolder;
  spender: Erc20TokenHolder;
  value: string;
};

export class Erc20TokenContract {
  private static ABI = require(__dirname + '../../../abi/erc20.json');
  private _contract: Contract;

  constructor(public readonly account: EthqlAccount, readonly context: EthqlContext) {
    this._contract = new context.services.web3.eth.Contract(Erc20TokenContract.ABI, account.address);
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
}

export class Erc20TokenHolder {
  constructor(public readonly account: EthqlAccount, private readonly contract: Erc20TokenContract) {}

  public async tokenBalance() {
    return this.contract.balanceOf({ ...this.account });
  }
}
