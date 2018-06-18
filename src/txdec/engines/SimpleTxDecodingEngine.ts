import * as _ from 'lodash';
import EthqlTransaction from '../../model/core/EthqlTransaction';
import { DecodedTx, TxDecoderDefinition, TxDecodingEngine } from '../types';

/**
 * A transaction decoding engine that matches the incoming transaction against a list of known ABIs.
 */
class SimpleTxDecodingEngine implements TxDecodingEngine {
  private readonly knownTxTypes = new Array<TxDecoderDefinition<any>>();

  public register(txType: TxDecoderDefinition<any>) {
    this.knownTxTypes.push(txType);
  }

  /**
   * Decodes the transaction as a known type, or returns undefined if unable to.
   * @param tx The transaction to decode.
   */
  public decodeTransaction<T extends DecodedTx>(tx: EthqlTransaction): T | undefined {
    const { inputData } = tx;
    if (!inputData || inputData === '0x') {
      return;
    }

    for (const txType of this.knownTxTypes) {
      const decoded = txType.decoder(tx.inputData);
      if (decoded && decoded.name in txType.transformers) {
        return {
          standard: txType.standard,
          operation: decoded.name,
          __typename: `${txType.standard}${_.upperFirst(decoded.name)}`,
          ...txType.transformers[decoded.name](decoded, tx),
        };
      }
    }
  }
}

export { SimpleTxDecodingEngine };
