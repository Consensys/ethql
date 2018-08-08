import { GraphQLResolveInfo } from 'graphql';
import { EthqlContext } from '../../context';
import { EthqlAccount, EthqlBlock, EthqlTransaction } from '../model';

type TransactionFilter = { filter: { withInput?: boolean; withLogs?: boolean; contractCreation?: boolean } };
type TransactionsInvolvingArgs = { participants: string[] } & TransactionFilter;
type TransactionsRolesArgs = { from: string; to: string } & TransactionFilter;

/**
 * Creates a filtering function for transactions based on the user-provided filter parameters.
 *
 * @param filter The user-provided filter parameters.
 */
function transactionFilter({ filter }: TransactionFilter): (tx: EthqlTransaction) => boolean {
  if (!filter) {
    return _ => true;
  }

  // Binary filter for input data.
  const withInput =
    filter.withInput === undefined ? _ => true : filter.withInput ? tx => !!tx.inputData : tx => !tx.inputData;

  // Binary filter for transactions with/without logs.
  const withLogs =
    filter.withLogs === undefined ? _ => true : filter.withLogs ? tx => !!tx.logs.length : tx => !tx.logs.length;

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

/**
 * Gets the miner account.
 */
async function miner(
  obj: EthqlBlock,
  _,
  { ethService }: EthqlContext,
  info: GraphQLResolveInfo,
): Promise<EthqlAccount> {
  return new EthqlAccount(obj.miner.address);
}

/**
 * Gets the parent block.
 */
async function parent(obj: EthqlBlock, _, { ethService }: EthqlContext, info: GraphQLResolveInfo): Promise<EthqlBlock> {
  return ethService.fetchBlock(obj.parentHash, info);
}

/**
 * Gets all transactions from this block.
 */
function transactions(obj: EthqlBlock, args: TransactionFilter) {
  return obj.transactions.filter(transactionFilter(args));
}

/**
 * Gets the transaction at the specified index.
 */
async function transactionAt(obj: EthqlBlock, { index }, { ethService }: EthqlContext): Promise<EthqlTransaction> {
  return index < 0 ? null : ethService.fetchTxFromBlock(obj.hash, index);
}

/**
 * Gets all transactions from the block involving any of the specified participants.
 */
function transactionsInvolving(obj: EthqlBlock, args: TransactionsInvolvingArgs): EthqlTransaction[] {
  const { participants } = args;
  if (!participants || !participants.length) {
    throw new Error('Expected at least one participant.');
  }

  return obj.transactions
    .filter(tx => participants.some(p => tx.from.equals(p) || tx.to.equals(p)))
    .filter(transactionFilter(args));
}

/**
 * Gets transactions whose from and/or to addresses match the provided ones.
 * The operator is an OR (i.e. any of the participants, or both, match).
 */
function transactionsRoles(obj: EthqlBlock, args: TransactionsRolesArgs): EthqlTransaction[] {
  const { from, to } = args;
  if (!(from || to)) {
    throw new Error('Expected one or both of a from address and a to address.');
  }

  // Note: the EthqlAccount#equals method is lenient to nulls/undefined.
  return obj.transactions
    .filter(tx => (from === undefined || tx.from.equals(from)) && (to === undefined || tx.to.equals(to)))
    .filter(transactionFilter(args));
}

export default {
  Block: {
    miner,
    parent,
    transactions,
    transactionAt,
    transactionsInvolving,
    transactionsRoles,
  },
};
