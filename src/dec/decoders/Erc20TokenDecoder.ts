import Contract from 'web3/eth/contract';
import { EthqlContext } from '../../context';
import { EthqlAccount, EthqlTransaction } from '../../core/model';
import { DecoderDefinition } from '../types';
import { createAbiDecoder, extractParamValue } from '../utils';

interface Erc20Transaction {
  tokenContract: Erc20TokenContract;
}

class Erc20TokenContract {
  private static ABI = require(__dirname + '../../../abi/erc20.json');
  private _contract: Contract;

  constructor(public readonly account: EthqlAccount, readonly context: EthqlContext) {
    this._contract = new context.web3.eth.Contract(Erc20TokenContract.ABI, account.address);
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

class Erc20TokenHolder {
  constructor(public readonly account: EthqlAccount, private readonly contract: Erc20TokenContract) {}

  public async tokenBalance() {
    return this.contract.balanceOf({ ...this.account });
  }
}

interface Erc20Transfer extends Erc20Transaction {
  from: Erc20TokenHolder;
  to: Erc20TokenHolder;
  value: string;
}

interface Erc20Approve extends Erc20Transaction {
  from: Erc20TokenHolder;
  spender: Erc20TokenHolder;
  value: string;
}

interface Erc20TransferFrom extends Erc20Transaction {
  from: Erc20TokenHolder;
  to: Erc20TokenHolder;
  spender: Erc20TokenHolder;
  value: string;
}

type Erc20TxBindings = {
  transfer: Erc20Transfer;
  approve: Erc20Approve;
  transferFrom: Erc20TransferFrom;
};

type ERC20TransferEvent = {
  from: Erc20TokenHolder;
  to: Erc20TokenHolder;
  value: string;
};

type ERC20ApprovalEvent = {
  owner: Erc20TokenHolder;
  spender: Erc20TokenHolder;
  value: string;
};

type Erc20LogBindings = {
  Transfer: ERC20TransferEvent;
  Approval: ERC20ApprovalEvent;
};

/**
 * ERC20 token transaction decoder.
 */
class Erc20TokenDecoder implements DecoderDefinition<Erc20TxBindings, Erc20LogBindings> {
  public readonly entity = 'token';
  public readonly standard = 'ERC20';
  public readonly abiDecoder = createAbiDecoder(__dirname + '../../../abi/erc20.json');

  public readonly txTransformers = {
    transfer: (decoded: any, tx: EthqlTransaction, context: EthqlContext) => {
      const tokenContract = new Erc20TokenContract(tx.to, context);
      const to = new EthqlAccount(extractParamValue(decoded.params, 'to'));
      return {
        tokenContract,
        from: new Erc20TokenHolder(tx.from, tokenContract),
        value: extractParamValue(decoded.params, 'value'),
        to: new Erc20TokenHolder(to, tokenContract),
      };
    },

    approve: (decoded: any, tx: EthqlTransaction, context: EthqlContext) => {
      const tokenContract = new Erc20TokenContract(tx.to, context);
      const spender = new EthqlAccount(extractParamValue(decoded.params, 'spender'));
      return {
        tokenContract,
        from: new Erc20TokenHolder(tx.from, tokenContract),
        value: extractParamValue(decoded.params, 'value'),
        spender: new Erc20TokenHolder(spender, tokenContract),
      };
    },

    transferFrom: (decoded: any, tx: EthqlTransaction, context: EthqlContext) => {
      const tokenContract = new Erc20TokenContract(tx.to, context);
      const from = new EthqlAccount(extractParamValue(decoded.params, 'from'));
      const to = new EthqlAccount(extractParamValue(decoded.params, 'to'));
      const spender = tx.from;
      return {
        tokenContract,
        from: new Erc20TokenHolder(from, tokenContract),
        to: new Erc20TokenHolder(to, tokenContract),
        spender: new Erc20TokenHolder(spender, tokenContract),
        value: extractParamValue(decoded.params, 'value'),
      };
    },
  };

  public readonly logTransformers = {
    Approval: (decoded: any, tx: EthqlTransaction, context: EthqlContext): ERC20ApprovalEvent => {
      const tokenContract = new Erc20TokenContract(tx.to, context);
      const owner = new EthqlAccount(extractParamValue(decoded.events, 'owner'));
      const spender = new EthqlAccount(extractParamValue(decoded.events, 'spender'));

      return {
        owner: new Erc20TokenHolder(owner, tokenContract),
        spender: new Erc20TokenHolder(spender, tokenContract),
        value: extractParamValue(decoded.events, 'value'),
      };
    },

    Transfer: (decoded: any, tx: EthqlTransaction, context: EthqlContext): ERC20TransferEvent => {
      const tokenContract = new Erc20TokenContract(tx.to, context);
      const from = new EthqlAccount(extractParamValue(decoded.events, 'from'));
      const to = new EthqlAccount(extractParamValue(decoded.events, 'to'));

      return {
        from: new Erc20TokenHolder(from, tokenContract),
        to: new Erc20TokenHolder(to, tokenContract),
        value: extractParamValue(decoded.events, 'value'),
      };
    },
  };
}

export default Erc20TokenDecoder;
