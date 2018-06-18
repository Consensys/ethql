import { Transaction } from 'web3/eth/types';
import engine from '../../txdec';
import EthqlAccount from './EthqlAccount';

type Overwrite<T1, T2> = { [P in Exclude<keyof T1, keyof T2>]: T1[P] } & T2;

type Overwritten = {
  from: EthqlAccount;
  to: EthqlAccount;
  input: never;
};

interface EthqlTransaction extends Overwrite<Transaction, Overwritten> {}

class EthqlTransaction {
  public readonly from: EthqlAccount;
  public readonly to: EthqlAccount;
  public readonly inputData: string;

  constructor(tx: Transaction) {
    const { from, to, input, ...rest } = tx;

    Object.assign(this, rest);

    this.from = new EthqlAccount(from);
    this.to = new EthqlAccount(to);
    this.inputData = tx.input;
  }

  public get index() {
    return this.transactionIndex;
  }

  public get decoded() {
    if (!this.inputData || this.inputData === '0x') {
      return null;
    }
    return engine.decodeTransaction(this);
  }
}

export default EthqlTransaction;
