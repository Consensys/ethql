import Web3 = require('web3');
import { Options } from '../config';
import { DecodingEngine } from '../dec/types';

interface EthqlContext {
  web3: Web3;
  config: Options;
  decodingEngine: DecodingEngine;
}

class EthqlContextFactory {
  constructor(public web3Factory: () => Web3, public config: Options, public decodingEngine: DecodingEngine) {}

  public create(): EthqlContext {
    return {
      web3: this.web3Factory.call(undefined),
      config: this.config,
      decodingEngine: this.decodingEngine,
    };
  }
}

export { EthqlContext, EthqlContextFactory };
