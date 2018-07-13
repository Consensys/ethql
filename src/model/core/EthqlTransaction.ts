import { GraphQLResolveInfo } from 'graphql';
import { Transaction } from 'web3/eth/types';
import engine from '../../txdec';
import { EthqlContext } from '../EthqlContext';
import EthqlAccount from './EthqlAccount';
import EthqlBlock from './EthqlBlock';

type Overwrite<T1, T2> = { [P in Exclude<keyof T1, keyof T2>]: T1[P] } & T2;

type Overwritten = {
  from: EthqlAccount;
  to: EthqlAccount;
  input: never;
};

interface EthqlTransaction extends Overwrite<Transaction, Overwritten> {}

class EthqlTransaction {
  public static async loadFromBlock(
    blockHash: string,
    txIndex: number,
    context: EthqlContext,
  ): Promise<EthqlTransaction> {
    const tx = await context.web3.eth.getTransactionFromBlock(blockHash, txIndex);
    return tx && new EthqlTransaction(tx);
  }

  public static async loadStandalone(txHash: string, context: EthqlContext): Promise<EthqlTransaction> {
    const tx = await context.web3.eth.getTransaction(txHash);
    return tx && new EthqlTransaction(tx);
  }

  public readonly from: EthqlAccount;
  public readonly to: EthqlAccount;
  public readonly inputData: string;

  constructor(tx: Transaction) {
    const { from, to, input, ...rest } = tx;

    Object.assign(this, rest);

    this.from = new EthqlAccount(from);
    this.to = new EthqlAccount(to);
    this.inputData = !tx.input || tx.input === '0x' ? null : tx.input;
  }

  public get index() {
    return this.transactionIndex;
  }

  public async decoded(_, context: EthqlContext) {
    if (!this.inputData || this.inputData === '0x') {
      return null;
    }

    return engine.decodeTransaction(this, context);
  }

  public async block(_, context: EthqlContext, info: GraphQLResolveInfo) {
    return this.blockNumber ? EthqlBlock.load(this.blockNumber, context, info) : null;
  }

  public async status(_, context: EthqlContext) {
    const { status } = await context.web3.eth.getTransactionReceipt(this.hash);
    return status === undefined ? null : status ? 'SUCCESS' : 'FAILED';
  }
}

export default EthqlTransaction;
