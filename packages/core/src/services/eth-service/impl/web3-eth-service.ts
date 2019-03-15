import * as Debug from 'debug';
import { GraphQLResolveInfo } from 'graphql';
import * as _ from 'lodash';
import Web3 = require('web3');
import { Hex } from 'web3-utils/types';
import { EthService, fetchHints, FetchHints } from '..';
import { EthqlAccount, EthqlBlock, EthqlLog, EthqlTransaction, LogFilter, TransactionStatus } from '../../../model';

const debug = Debug.debug('ethql:web3');

// Not thrilled about having to copy this in here.
type GetPastLogsOpts = {
  fromBlock?: Hex;
  toBlock?: Hex;
  address?: string;
  topics?: Array<string | string[]>;
};

/**
 * A private function to return a prepped param object for the getPastLogs call
 * @param id (Hex) a block number or hex reference
 * @return GetPastLogOpts structure
 */
function formatPastLogsParams(id: Hex): GetPastLogsOpts {
  let hexId = typeof id === 'number' ? Web3.utils.toHex(id) : id;
  return { fromBlock: hexId, toBlock: hexId };
}

export class Web3EthService implements EthService {
  constructor(private web3: Web3) {}

  public async fetchBlock(id: number | string, infoOrHints: GraphQLResolveInfo | FetchHints): Promise<EthqlBlock> {
    const hints = (infoOrHints as any).fieldName
      ? fetchHints(infoOrHints as GraphQLResolveInfo)
      : (infoOrHints as FetchHints);

    debug('fetchBlock %s args: %O', id, hints);

    if (hints.logs) {
      // getPastLogs does not convert number => hex block numbers, so we have to do it manually.
      let args = formatPastLogsParams(id);
      const logOpts = hints.logFilters ? { ...args, topics: hints.logFilters } : args;
      debug('block logOpts: %O', logOpts);
      const [block, logs] = await Promise.all([
        this.web3.eth.getBlock(id, hints.transactions),
        this.web3.eth.getPastLogs(logOpts),
      ]);

      return block && new EthqlBlock(block, logs);
    }

    debug('fetching block %s, no logs', id);
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

  public async fetchBalance({ address }: EthqlAccount): Promise<number> {
    return address && this.web3.eth.getBalance(address);
  }

  public async fetchCode({ address }: EthqlAccount): Promise<string> {
    return address && this.web3.eth.getCode(address).then(code => (!code || code === '0x' ? null : code));
  }

  public async fetchStorage({ address }: EthqlAccount, position: number): Promise<string> {
    return address && this.web3.eth.getStorageAt(address, position);
  }

  public async fetchTransactionCount({ address }: EthqlAccount): Promise<number> {
    return address && this.web3.eth.getTransactionCount(address);
  }

  public async fetchTransactionLogs(tx: EthqlTransaction, filter: LogFilter): Promise<EthqlLog[]> {
    let args = formatPastLogsParams(tx.blockNumber);
    const logOpts = filter ? { ...args,  topics: filter.topics } : args;

    debug('fetchTxLogs: %s  %O', tx.blockNumber, logOpts);
    const logs = await this.web3.eth.getPastLogs(logOpts);

    const logsByTxIdx = _.groupBy(logs, l => l.transactionIndex);
    return logs && (tx.logs = logsByTxIdx[tx.index] ? logsByTxIdx[tx.index].map(l => new EthqlLog(l, tx)) : []);
  }

  public async fetchCreatedContract(tx: EthqlTransaction): Promise<EthqlAccount> {
    const receipt = await this.web3.eth.getTransactionReceipt(tx.hash);
    return receipt && receipt.contractAddress && new EthqlAccount(receipt.contractAddress);
  }

  public async fetchTransactionStatus(tx: EthqlTransaction): Promise<TransactionStatus> {
    const receipt = await this.web3.eth.getTransactionReceipt(tx.hash);
    if (!receipt) {
      return 'PENDING';
    }
    return receipt.status === undefined ? null : receipt.status ? 'SUCCESS' : 'FAILED';
  }

}
