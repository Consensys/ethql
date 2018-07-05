import Web3 = require('web3');
import { Options } from '../config';
import { TxDecodingEngine } from '../txdec/types';

interface EthqlContext {
  web3: Web3;
  config: Options;
  txDecoder: TxDecodingEngine;
}

class EthqlContextFactory {
  constructor(public web3Factory: () => Web3, public config: Options, public txDecoder: TxDecodingEngine) {}

  public create(): EthqlContext {
    return {
      web3: this.web3Factory.call(undefined),
      config: this.config,
      txDecoder: this.txDecoder,
    };
  }
}

export { EthqlContext, EthqlContextFactory };
