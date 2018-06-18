import { Block } from 'web3/eth/types';
import EthqlTransaction from './EthqlTransaction';

type Overwrite<T1, T2> = { [P in Exclude<keyof T1, keyof T2>]: T1[P] } & T2;

type Overwritten = {
  transactions: EthqlTransaction[];
};

interface EthqlBlock extends Overwrite<Block, Overwritten> {}

interface TransactionsInvolvingArgs {
  participants: string[];
}

interface TransactionsRolesArgs {
  from: string;
  to: string;
}

class EthqlBlock implements EthqlBlock {
  public transactions: EthqlTransaction[];

  constructor(block: Block) {
    const { transactions, ...rest } = block;
    Object.assign(this, rest);

    this.transactions = transactions.map(t => new EthqlTransaction(t));
  }

  public transactionCount() {
    return this.transactions.length;
  }

  public transactionAt(args): EthqlTransaction {
    return this.transactions[args.index];
  }

  public transactionsInvolving({ participants }: TransactionsInvolvingArgs): EthqlTransaction[] {
    if (!participants || !participants.length) {
      throw new Error('Expected at least one participant.');
    }
    return this.transactions.filter(tx => participants.some(p => tx.from.equals(p) || tx.to.equals(p)));
  }

  public transactionsRoles({ from, to }: TransactionsRolesArgs) {
    if (!(from || to)) {
      throw new Error('Expected one or both of a from address and a to address.');
    }

    // Note: the EthqlAccount#equals method is lenient to nulls/undefined.
    return this.transactions.filter(tx => tx.from.equals(from) || tx.to.equals(to));
  }
}

export default EthqlBlock;
