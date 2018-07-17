import { ArgumentNode, FieldNode, GraphQLResolveInfo, ObjectFieldNode, ObjectValueNode } from 'graphql';
import * as _ from 'lodash';
import { Block } from 'web3/eth/types';
import { Log } from 'web3/types';
import { Overwrite } from '../../utils';
import { EthqlContext } from '../EthqlContext';
import EthqlAccount from './EthqlAccount';
import EthqlTransaction from './EthqlTransaction';

function flatMap<T, U>(array: T[], callbackfn: (value: T, index: number, array: T[]) => U[]): U[] {
  return [].concat(...array.map(callbackfn));
}

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
  public static async load(id: number | string, { web3 }: EthqlContext, info: GraphQLResolveInfo): Promise<EthqlBlock> {
    const fetchHints = EthqlBlock.fetchHints(info);

    if (fetchHints.logs) {
      // getPastLogs does not convert number => hex block numbers, so we have to do it manually.
      const idHex = typeof id === 'number' ? web3.utils.toHex(id) : id;

      const [block, logs] = await Promise.all([
        web3.eth.getBlock(id, fetchHints.transactions),
        web3.eth.getPastLogs({ fromBlock: idHex, toBlock: idHex }),
      ]);

      return block && new EthqlBlock(block, logs);
    }

    const block = await web3.eth.getBlock(id, fetchHints.transactions);
    return block && new EthqlBlock(block);
  }

  private static TX_REQUIRING_FIELDS = ['transactions', 'transactionsInvolving', 'transactionsRoles'];

  /**
   * Returns an object with the fetch hints for this block.
   *
   * @param info The GraphQL resolution info.
   */
  private static fetchHints(info: GraphQLResolveInfo) {
    const txFields = info.fieldNodes[0].selectionSet.selections.filter(
      s => s.kind === 'Field' && EthqlBlock.TX_REQUIRING_FIELDS.indexOf(s.name.value) >= 0,
    );

    const logsFields = txFields.filter(
      f => f.kind === 'Field' && f.selectionSet.selections.some(f => f.kind === 'Field' && f.name.value === 'logs'),
    );

    const filters = flatMap(txFields, f => (f as FieldNode).arguments as ArgumentNode[]) //
      .filter(a => a.name.value === 'filter');

    const logFilters = flatMap(filters, a => (a.value as ObjectValueNode).fields as ObjectFieldNode[]) //
      .filter(af => (af as ObjectFieldNode).name.value === 'withLogs');

    return {
      transactions: !!txFields.length,
      logs: !!logsFields.length || !!logFilters.length,
    };
  }

  /**
   * Creates a filtering function for transactions based on the user-provided filter parameters.
   *
   * @param filter The user-provided filter parameters.
   */
  private static transactionFilter(filter: TransactionFilter): (tx: EthqlTransaction) => boolean {
    if (!filter) {
      return _ => true;
    }

    // Binary filter for input data.
    const withInput =
      filter.withInput === undefined ? _ => true : filter.withInput ? tx => !!tx.inputData : tx => !tx.inputData;

    // Binary filter for transactions with/without logs.
    const withLogs =
      filter.withLogs === undefined
        ? _ => true
        : filter.withLogs
          ? tx => !!tx.getLogs().length
          : tx => !tx.getLogs().length;

    // Binary filter for contract creations.
    const contractCreation =
      filter.contractCreation === undefined
        ? _ => true
        : filter.contractCreation
          ? tx => tx.to.address === null
          : tx => tx.to.address !== null;

    // Compose the filters.
    return tx => withInput(tx) && contractCreation(tx) && withLogs(tx);
  }

  private _transactions: EthqlTransaction[];

  constructor(block: Block, logs?: Log[]) {
    const { transactions, miner, ...rest } = block;
    Object.assign(this, rest);

    this.miner = new EthqlAccount(block.miner);

    if (logs) {
      const logsByTxIdx = _.groupBy(logs, l => l.transactionIndex);
      this._transactions = transactions.map(tx => new EthqlTransaction(tx, logsByTxIdx[tx.transactionIndex] || []));
    } else {
      this._transactions = transactions.map(tx => new EthqlTransaction(tx));
    }
  }

  /**
   * Gets the parent block.
   */
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
