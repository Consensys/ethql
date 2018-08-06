import { ArgumentNode, FieldNode, GraphQLResolveInfo, ObjectFieldNode, ObjectValueNode } from 'graphql';
import * as _ from 'lodash';
import Web3 = require('web3');
import { EthqlBlock, EthqlTransaction } from '../model';

const TX_REQUIRING_FIELDS = ['transactions', 'transactionsInvolving', 'transactionsRoles'];

type FetchHints = { transactions?: boolean; logs?: boolean };

export default class EthService {
  constructor(private web3: Web3) {}

  public async fetchBlock(id: number | string, infoOrHints: GraphQLResolveInfo | FetchHints): Promise<EthqlBlock> {
    const hints = (infoOrHints as any).fieldName
      ? fetchHints(infoOrHints as GraphQLResolveInfo)
      : (infoOrHints as FetchHints);

    if (hints.logs) {
      // getPastLogs does not convert number => hex block numbers, so we have to do it manually.
      const idHex = typeof id === 'number' ? this.web3.utils.toHex(id) : id;

      const [block, logs] = await Promise.all([
        this.web3.eth.getBlock(id, hints.transactions),
        this.web3.eth.getPastLogs({ fromBlock: idHex, toBlock: idHex }),
      ]);

      return block && new EthqlBlock(block, logs);
    }

    const block = await this.web3.eth.getBlock(id, hints.transactions);
    return block && new EthqlBlock(block);
  }

  public async fetchTxFromBlock(blockHash: string, txIndex: number): Promise<EthqlTransaction> {
    const tx = await this.web3.eth.getTransactionFromBlock(blockHash, txIndex);
    return tx && new EthqlTransaction(tx);
  }

  public async fetchStandaloneTx(txHash: string): Promise<EthqlTransaction> {
    const tx = await this.web3.eth.getTransaction(txHash);
    return tx && new EthqlTransaction(tx);
  }
}

/**
 * Returns an object with the fetch hints for this block.
 *
 * @param info The GraphQL resolution info.
 */
function fetchHints(info: GraphQLResolveInfo): FetchHints {
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
