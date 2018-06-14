import Web3 = require('web3');
import { Options } from '../config';
import { TxDecodingEngine } from '../txdec/types';

class EthqlContext {
  constructor(public web3: Web3, public config: Options, public txDecoder: TxDecodingEngine) {}
}

export default EthqlContext;
