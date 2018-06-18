import EthqlAccount from '../../model/core/EthqlAccount';
import EthqlTransaction from '../../model/core/EthqlTransaction';
import { TxDecoderDefinition } from '../types';
import { createAbiDecoder, extractParamValue } from '../utils';

interface Erc20Transfer {
  from: EthqlAccount;
  to: EthqlAccount;
  value: string;
}

interface Erc20Approve {
  from: EthqlAccount;
  spender: EthqlAccount;
  value: string;
}

interface Erc20TransferFrom {
  from: EthqlAccount;
  to: EthqlAccount;
  spender: EthqlAccount;
  value: string;
}

type Erc20Bindings = {
  transfer: Erc20Transfer;
  approve: Erc20Approve;
  transferFrom: Erc20TransferFrom;
};

/**
 * ERC20 transaction decoder.
 */
class Erc20 implements TxDecoderDefinition<Erc20Bindings> {
  public readonly standard = 'ERC20';
  public readonly decoder = createAbiDecoder(__dirname + '../../../abi/erc20.json');

  public readonly transformers = {
    transfer: (decoded: any, tx: EthqlTransaction) => {
      return {
        from: tx.from,
        value: extractParamValue(decoded.params, 'value'),
        to: new EthqlAccount(extractParamValue(decoded.params, 'to')),
      };
    },
    approve: (decoded: any, tx: EthqlTransaction) => {
      return {
        from: tx.from,
        value: extractParamValue(decoded.params, 'value'),
        spender: new EthqlAccount(extractParamValue(decoded.params, 'spender')),
      };
    },

    transferFrom: (decoded: any, tx: EthqlTransaction) => {
      return {
        from: new EthqlAccount(extractParamValue(decoded.params, 'from')),
        to: new EthqlAccount(extractParamValue(decoded.params, 'to')),
        spender: tx.from,
        value: extractParamValue(decoded.params, 'value'),
      };
    },
  };
}

export default Erc20;
