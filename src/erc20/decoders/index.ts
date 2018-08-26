import { EthqlContext } from '../../context';
import { EthqlAccount, EthqlTransaction } from '../../core/model';
import { createAbiDecoder, DecoderDefinition, extractParamValue } from '../../core/services/decoder';
import {
  ERC20ApprovalEvent,
  Erc20Approve,
  Erc20TokenContract,
  Erc20TokenHolder,
  Erc20Transfer,
  ERC20TransferEvent,
  Erc20TransferFrom,
} from '../model';

type Erc20LogBindings = {
  Transfer: ERC20TransferEvent;
  Approval: ERC20ApprovalEvent;
};

type Erc20TxBindings = {
  transfer: Erc20Transfer;
  approve: Erc20Approve;
  transferFrom: Erc20TransferFrom;
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

export { Erc20TokenDecoder };
