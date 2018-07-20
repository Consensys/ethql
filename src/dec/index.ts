import Erc20TokenDecoder from './decoders/Erc20TokenDecoder';
import { SimpleDecodingEngine } from './engines/SimpleDecodingEngine';
import { DecodingEngine } from './types';

// Create the engine.
const engine = new SimpleDecodingEngine();

// Register all decoders.
engine.register(new Erc20TokenDecoder());

// Export the engine, making only the decode methods visible.
export default engine as Pick<DecodingEngine, 'decodeTransaction' | 'decodeLog' | 'decodeContract'>;
