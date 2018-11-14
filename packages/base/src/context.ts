import { Options } from './config';
import { EthqlServiceFactories, EthqlServices } from './services';

export class EthqlContext {
  public readonly services: EthqlServices;

  constructor(public readonly config: Options, serviceFactories: EthqlServiceFactories) {
    this.services = new EthqlServices(serviceFactories, this);
  }
}
