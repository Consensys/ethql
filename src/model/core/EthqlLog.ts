import { Log } from 'web3/types';
import { GraphQLResolveInfo } from '../../../node_modules/@types/graphql';
import { Overwrite } from '../../utils';
import { EthqlContext } from '../EthqlContext';
import EthqlAccount from './EthqlAccount';
import EthqlBlock from './EthqlBlock';
import EthqlTransaction from './EthqlTransaction';

// Rename logIndex => index.
type Overwritten = {
  logIndex: never;
  index: number;
};

interface EthqlLog extends Overwrite<Log, Overwritten> {}

class EthqlLog {
  constructor(log: Log, public transaction: EthqlTransaction) {
    const { logIndex, ...rest } = log;
    Object.assign(this, rest);
    this.index = logIndex;
  }

  /**
   * Attempts to decode the log.
   */
  public async decoded(_, context: EthqlContext) {
    return context.decodingEngine.decodeLog(this, context);
  }

  /**
   * Gets the block this log belongs to.
   */
  public async block(_, context: EthqlContext, info: GraphQLResolveInfo): Promise<EthqlBlock> {
    return EthqlBlock.load(this.blockHash, context, info);
  }

  /**
   * The account that emitted this log.
   */
  public account() {
    return new EthqlAccount(this.address);
  }
}

export default EthqlLog;
