import Web3 = require('web3');
import { Options } from './config';
import EthService from './core/services/eth-service';
import { DecodingEngine } from './dec/types';

interface EthqlContext {
  web3: Web3;
  config: Options;
  decodingEngine: DecodingEngine;
  ethService: EthService;
}

class EthqlContextFactory {
  constructor(public web3Factory: () => Web3, public config: Options, public decodingEngine: DecodingEngine) {}

  public create(): EthqlContext {
    const web3 = this.web3Factory.call(undefined);
    return {
      web3,
      config: this.config,
      decodingEngine: this.decodingEngine,
      ethService: new EthService(web3),
    };
  }
}

export { EthqlContext, EthqlContextFactory };
