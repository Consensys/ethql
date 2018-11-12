import ENS = require('ez-ens');

declare module '../../services' {
  interface EthqlServices {
    ens: ENS;
  }

  interface EthqlServiceDefinitions {
    ens: EthqlServiceDefinition<{}, ENS>;
  }
}
