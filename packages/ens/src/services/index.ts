import { EthqlContext, EthqlServiceDefinition } from '@ethql/base';
import ENS = require('ez-ens');

declare module '@ethql/base' {
  interface EthqlServices {
    ens: ENS;
  }

  interface EthqlServiceDefinitions {
    ens: EthqlServiceDefinition<{}, ENS>;
  }
}
