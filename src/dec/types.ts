import EthqlLog from '../model/core/EthqlLog';
import EthqlTransaction from '../model/core/EthqlTransaction';
import { EthqlContext } from '../model/EthqlContext';

// Defines the entity to which the standard belongs.
// As we support new standards, this union type will expand.
type Entity = 'token' | undefined;

export type AbiDecoder = {
  decodeMethod: Function;
  decodeLogs: Function;
};

/**
 * A definition for a transaction decoder, where TxBindings is a dictionary of ABI
 * function names mapped to their decoded types, and txTransformers is a dictionary of
 * functions that transform the raw transaction into a typed transaction, for each function
 * in the ABI.
 */
export interface DecoderDefinition<TxBindings, LogBindings> {
  readonly entity: Entity;
  readonly standard: string;
  readonly abiDecoder: AbiDecoder;
  readonly txTransformers: {
    [P in keyof TxBindings]: (decoded: any, tx: EthqlTransaction, context: EthqlContext) => TxBindings[P]
  };
  readonly logTransformers: {
    [P in keyof LogBindings]: (decoded: any, tx: EthqlTransaction, context: EthqlContext) => LogBindings[P]
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
 * A decoded log.
 */
export type DecodedLog = {
  entity: Entity;
  standard: string;
  event: string;
};

/**
 * A decoding engine.
 */
export type DecodingEngine = {
  decodeTransaction(tx: EthqlTransaction, context: EthqlContext): DecodedTx;
  decodeLog(tx: EthqlLog, context: EthqlContext): DecodedLog;
};
