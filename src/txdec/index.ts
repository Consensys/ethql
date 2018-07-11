import Erc20Token from './decoders/Erc20Token';
import { SimpleTxDecodingEngine } from './engines/SimpleTxDecodingEngine';
import { TxDecodingEngine } from './types';

// Create the engine.
const engine = new SimpleTxDecodingEngine();

// Register all decoders.
engine.register(new Erc20Token());

// Export the engine, making only the decodeTransaction method visible.
export default engine as Pick<TxDecodingEngine, 'decodeTransaction'>;
