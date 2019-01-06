import { EthqlServiceFactories, EthqlServices } from '.';
import { Options } from './config';

export class EthqlContext {
  public readonly services: EthqlServices;

  constructor(public readonly config: Options, serviceFactories: EthqlServiceFactories) {
    this.services = new EthqlServices(serviceFactories, this);
  }
}
