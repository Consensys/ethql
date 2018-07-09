import EthqlTransaction from '../model/core/EthqlTransaction';
import { EthqlContext } from '../model/EthqlContext';

// Defines the entity to which the standard belongs.
// As we support new standards, this union type will expand.
type Entity = 'token' | undefined;

/**
 * A definition for a transaction decoder, where TBindings is a dictionary of ABI
 * function names mapped to their decoded types, and transformers is a dictionary of
 * functions that transform the raw transaction into a typed transaction, for each function
 * in the ABI.
 */
export interface TxDecoderDefinition<TBindings> {
  readonly entity: Entity;
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
  entity: Entity;
  standard: string;
  operation: string;
  __typename: string;
};

/**
 * A decoding engine.
 */
export type TxDecodingEngine = {
  decodeTransaction(tx: EthqlTransaction, context: EthqlContext): DecodedTx;
};
