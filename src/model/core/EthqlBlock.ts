import { Block } from 'web3/eth/types';
import { EthqlContext } from '../EthqlContext';
import EthqlTransaction from './EthqlTransaction';

type Overwrite<T1, T2> = { [P in Exclude<keyof T1, keyof T2>]: T1[P] } & T2;

type Overwritten = {
  transactions: (filter: WithTransactionFilter) => EthqlTransaction[];
};

interface EthqlBlock extends Overwrite<Block, Overwritten> {}

interface TransactionFilter {
  withInput?: boolean;
  withLogs?: boolean;
  contractCreation?: boolean;
}

interface WithTransactionFilter {
  filter?: TransactionFilter;
}

interface TransactionsInvolvingArgs extends WithTransactionFilter {
  participants: string[];
}

interface TransactionsRolesArgs extends WithTransactionFilter {
  from: string;
  to: string;
}

class EthqlBlock implements EthqlBlock {
  private static transactionFilter(filter: TransactionFilter): (tx: EthqlTransaction) => boolean {
    if (!filter) {
      return _ => true;
    }

    const withInput =
      filter.withInput === undefined ? _ => true : filter.withInput ? tx => !!tx.inputData : tx => !tx.inputData;

    const contractCreation =
      filter.contractCreation === undefined
        ? _ => true
        : filter.contractCreation
          ? tx => tx.to.address === null
          : tx => tx.to.address !== null;

    return tx => withInput(tx) && contractCreation(tx);
  }

  //tslint:disable-next-line
  private _transactions: EthqlTransaction[];

  constructor(block: Block) {
    const { transactions, ...rest } = block;
    Object.assign(this, rest);

    this._transactions = transactions.map(t => new EthqlTransaction(t));
  }

  public transactions({ filter }: WithTransactionFilter) {
    return this._transactions.filter(EthqlBlock.transactionFilter(filter));
  }

  public transactionCount() {
    return this._transactions.length;
  }

  public async transactionAt(args, { web3 }: EthqlContext): Promise<EthqlTransaction> {
    if (args.index < 0) {
      return null;
    }
    const tx = await web3.eth.getTransactionFromBlock(this.hash, args.index);
    return tx && new EthqlTransaction(tx);
  }

  public transactionsInvolving({ participants, filter }: TransactionsInvolvingArgs): EthqlTransaction[] {
    if (!participants || !participants.length) {
      throw new Error('Expected at least one participant.');
    }
    return this._transactions
      .filter(tx => participants.some(p => tx.from.equals(p) || tx.to.equals(p)))
      .filter(EthqlBlock.transactionFilter(filter));
  }

  public transactionsRoles({ from, to, filter }: TransactionsRolesArgs): EthqlTransaction[] {
    if (!(from || to)) {
      throw new Error('Expected one or both of a from address and a to address.');
    }

    // Note: the EthqlAccount#equals method is lenient to nulls/undefined.
    return this._transactions
      .filter(tx => tx.from.equals(from) || tx.to.equals(to))
      .filter(EthqlBlock.transactionFilter(filter));
  }
}

export default EthqlBlock;
