import * as _ from 'lodash';
import { EthqlContext } from '../../context';
import { EthqlLog, EthqlTransaction } from '../../core/model';
import { DecodedLog, DecodedTransaction, DecoderDefinition, DecodingEngine } from '../types';

/**
 * A transaction decoding engine that matches the incoming transaction against a list of known ABIs.
 */
class SimpleDecodingEngine implements DecodingEngine {
  private readonly registry = new Array<DecoderDefinition<any, any>>();

  public register(decoder: DecoderDefinition<any, any>) {
    this.registry.push(decoder);
  }

  /**
   * Decodes the transaction as a known type, or returns undefined if unable to.
   *
   * @param tx The transaction to decode.
   * @param context ethql context.
   */
  public decodeTransaction(tx: EthqlTransaction, context: EthqlContext): DecodedTransaction | undefined {
    if (!tx.inputData) {
      return;
    }

    // Iterate through the registry until we find a decoder that's capable of decoding the function call.
    for (const decoder of this.registry) {
      const decoded = decoder.abiDecoder.decodeMethod(tx.inputData);

      // If the ABI decoder recognised the function call, apply the transformer if available.
      if (decoded && decoded.name in decoder.txTransformers) {
        return {
          standard: decoder.standard,
          operation: decoded.name,
          entity: decoder.entity,
          __typename: `${decoder.standard}${_.upperFirst(decoded.name)}`,
          ...decoder.txTransformers[decoded.name](decoded, tx, context),
        };
      }
    }
  }

  /**
   * Decodes a transaction against a set of ABIs, or returns undefined if unable to.
   *
   * @param log The log to decode.
   * @param context ethql context.
   */
  public decodeLog(log: EthqlLog, context: EthqlContext): DecodedLog | undefined {
    // Find a decoder that can process this log.
    for (const decoder of this.registry) {
      const logs: any[] = decoder.abiDecoder.decodeLogs([log]);
      if (!logs || logs[0] === undefined) {
        continue;
      }

      // Transform the returned log.
      const dlog = logs[0];
      return {
        standard: decoder.standard,
        event: dlog.name,
        entity: decoder.entity,
        __typename: `${decoder.standard}${_.upperFirst(dlog.name)}Event`,
        ...decoder.logTransformers[dlog.name](dlog, log.transaction, context),
      };
    }
  }
}

export { SimpleDecodingEngine };
