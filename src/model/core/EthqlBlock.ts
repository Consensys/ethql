import { GraphQLResolveInfo } from 'graphql';
import { Block } from 'web3/eth/types';
import { EthqlContext } from '../EthqlContext';
import EthqlAccount from './EthqlAccount';
import EthqlTransaction from './EthqlTransaction';

type Overwrite<T1, T2> = { [P in Exclude<keyof T1, keyof T2>]: T1[P] } & T2;

type Overwritten = {
  transactions: (filter: WithTransactionFilter) => EthqlTransaction[];
  miner: EthqlAccount;
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
  public static async load(id: number | string, context: EthqlContext, info: GraphQLResolveInfo): Promise<EthqlBlock> {
    const block = await context.web3.eth.getBlock(id, this.requiresFetchingTxs(info));
    return block && new EthqlBlock(block);
  }

  private static TX_REQUIRING_FIELDS = ['transactions', 'transactionsInvolving', 'transactionsRoles'];

  private static requiresFetchingTxs(info: GraphQLResolveInfo): boolean {
    return !!info.fieldNodes[0].selectionSet.selections.find(
      s => s.kind === 'Field' && EthqlBlock.TX_REQUIRING_FIELDS.indexOf(s.name.value) >= 0,
    );
  }

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
    const { transactions, miner, ...rest } = block;
    Object.assign(this, rest);

    this._transactions = transactions.map(t => new EthqlTransaction(t));
    this.miner = new EthqlAccount(block.miner);
  }

  public async parent(_, context: EthqlContext, info: GraphQLResolveInfo): Promise<EthqlBlock> {
    return EthqlBlock.load(this.parentHash, context, info);
  }

  /**
   * Gets all transactions from this block.
   */
  public transactions({ filter }: WithTransactionFilter) {
    return this._transactions.filter(EthqlBlock.transactionFilter(filter));
  }

  /**
   * Returns the number of transactions in this block.
   */
  public transactionCount() {
    return this._transactions.length;
  }

  /**
   * Gets the transaction at the specified index.
   */
  public async transactionAt({ index }, context: EthqlContext): Promise<EthqlTransaction> {
    if (index < 0) {
      return null;
    }
    return EthqlTransaction.loadFromBlock(this.hash, index, context);
  }

  /**
   * Gets all transactions from the block involving any of the specified participants.
   */
  public transactionsInvolving({ participants, filter }: TransactionsInvolvingArgs): EthqlTransaction[] {
    if (!participants || !participants.length) {
      throw new Error('Expected at least one participant.');
    }

    return this._transactions
      .filter(tx => participants.some(p => tx.from.equals(p) || tx.to.equals(p)))
      .filter(EthqlBlock.transactionFilter(filter));
  }

  /**
   * Gets transactions whose from and/or to addresses match the provided ones.
   * The operator is an OR (i.e. any of the participants, or both, match).
   */
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
