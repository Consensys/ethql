import EthqlTransaction from '../model/core/EthqlTransaction';
import { EthqlContext } from '../model/EthqlContext';

/**
 * A definition for a transaction decoder, where TBindings is a dictionary of ABI
 * function names mapped to their decoded types, and transformers is a dictionary of
 * functions that transform the raw transaction into a typed transaction, for each function
 * in the ABI.
 */
export interface TxDecoderDefinition<TBindings> {
  readonly standard: string;
  readonly decoder: any;
  readonly transformers: {
    [P in keyof TBindings]: (decoded: any, tx: EthqlTransaction, context: EthqlContext) => TBindings[P]
  };
}

/**
 * A decoded transaction.
 */
export type DecodedTx = {
  standard: string;
  operation: string;
  __typename: string;
};

/**
 * A decoding engine.
 */
export type TxDecodingEngine = {
  decodeTransaction<T extends DecodedTx>(tx: EthqlTransaction, context: EthqlContext): T;
};
