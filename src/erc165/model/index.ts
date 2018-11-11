export class Erc165InterfaceContract {
  private static ABI = require(__dirname + '../../../abi/erc165.json');
  private _contract: Contract;

  constructor(public readonly account: EthqlAccount, readonly context: EthqlContext) {
    this._contract = new context.services.web3.eth.Contract(Erc165InterfaceContract.ABI, account.address);
  }

  public async supportsInterface({ interfaceID }: { String }): Boolean {
    return contract.methods
      .supportsInterface(interfaceID)
      .call()
      .catch(console.error);
  }
}
