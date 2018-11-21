import ENS = require('ez-ens');

declare module '@ethql/base/dist/services' {
  interface EthqlServices {
    ens: ENS;
  }

  interface EthqlServiceDefinitions {
    ens: EthqlServiceDefinition<{}, ENS>;
  }
}
