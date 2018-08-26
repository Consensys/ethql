import { ArgumentNode, FieldNode, GraphQLResolveInfo, ObjectFieldNode, ObjectValueNode } from 'graphql';
import * as _ from 'lodash';
import { EthqlAccount, EthqlBlock, EthqlLog, EthqlTransaction, TransactionStatus } from '../../model';

declare module '../../../services' {
  interface EthqlServices {
    ethService: EthService;
  }

  interface EthqlServiceDefinitions {
    ethService: EthqlServiceDefinition<{}, EthService>;
  }
}

const TX_REQUIRING_FIELDS = ['transactions', 'transactionsInvolving', 'transactionsRoles'];

export type FetchHints = { transactions?: boolean; logs?: boolean };

export interface EthService {
  fetchBlock(id: number | string, infoOrHints: GraphQLResolveInfo | FetchHints): Promise<EthqlBlock>;
  fetchTxFromBlock(blockHash: string, txIndex: number): Promise<EthqlTransaction>;
  fetchStandaloneTx(txHash: string): Promise<EthqlTransaction>;
  fetchBalance(account: EthqlAccount): Promise<number>;
  fetchCode(account: EthqlAccount): Promise<string | undefined>;
  fetchStorage(account: EthqlAccount, position: number): Promise<string>;
  fetchTransactionCount(account: EthqlAccount): Promise<number>;
  fetchTransactionLogs(tx: EthqlTransaction): Promise<EthqlLog[]>;
  fetchCreatedContract(tx: EthqlTransaction): Promise<EthqlAccount>;
  fetchTransactionStatus(tx: EthqlTransaction): Promise<TransactionStatus>;
}

/**
 * Returns an object with the fetch hints for this block.
 *
 * @param info The GraphQL resolution info.
 */
export function fetchHints(info: GraphQLResolveInfo): FetchHints {
  const txFields = info.fieldNodes[0].selectionSet.selections.filter(
    s => s.kind === 'Field' && TX_REQUIRING_FIELDS.indexOf(s.name.value) >= 0,
  );

  const logsFields = txFields.filter(
    f => f.kind === 'Field' && f.selectionSet.selections.some(f => f.kind === 'Field' && f.name.value === 'logs'),
  );

  const filters = _.flatMap(txFields, f => (f as FieldNode).arguments as ArgumentNode[]) //
    .filter(a => a.name.value === 'filter');

  const logFilters = _.flatMap(filters, a => (a.value as ObjectValueNode).fields as ObjectFieldNode[]) //
    .filter(af => (af as ObjectFieldNode).name.value === 'withLogs');

  return {
    transactions: !!txFields.length,
    logs: !!logsFields.length || !!logFilters.length,
  };
}
