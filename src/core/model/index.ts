import { List } from 'immutable';
import * as _ from 'lodash';
import { Transaction } from 'web3/eth/types';
import { Block, Log } from 'web3/types';
import { Overwrite } from '../../utils';

/**
 * Account types.
 */
export enum EthqlAccountType {
  CONTRACT = 'CONTRACT',
  EXTERNALLY_OWNED = 'EXTERNALLY_OWNED',
}

export class EthqlAccount {
  constructor(public address: string) {}

  public equals(addressOrAccount: string | EthqlAccount) {
    // Fail soon if any of the addresses is null, which could stand for contract creation.
    if (!this.address || !addressOrAccount) {
      return false;
    }
    const address = typeof addressOrAccount === 'string' ? addressOrAccount : addressOrAccount.address;
    return this.address.toLowerCase() === address.toLowerCase();
  }
}

export interface EthqlLog
  extends Overwrite<
      Log,
      {
        logIndex: never;
        index: number;
      }
    > {}

export class EthqlLog {
  constructor(log: Log, public transaction: EthqlTransaction) {
    const { logIndex, ...rest } = log;
    Object.assign(this, rest);
    this.index = logIndex;
  }

  /**
   * The account that emitted this log.
   */
  public account() {
    return new EthqlAccount(this.address);
  }
}

export interface EthqlTransaction
  extends Overwrite<
      Transaction,
      {
        from: EthqlAccount;
        to: EthqlAccount;
        input: never;
        transactionIndex: never;
        index: number;
      }
    > {}

export class EthqlTransaction {
  public readonly from: EthqlAccount;
  public readonly to: EthqlAccount;
  public readonly inputData: string;
  public logs: EthqlLog[];

  constructor(tx: Transaction, logs?: Log[]) {
    const { from, to, input, transactionIndex, ...rest } = tx;

    Object.assign(this, rest);

    this.from = new EthqlAccount(from);
    this.to = new EthqlAccount(to);
    this.index = transactionIndex;
    this.inputData = !tx.input || tx.input === '0x' ? null : tx.input;

    if (logs) {
      this.logs = logs.map(l => new EthqlLog(l, this));
    }
  }
}

export interface EthqlBlock
  extends Overwrite<
      Block,
      {
        transactions: EthqlTransaction[];
        miner: EthqlAccount;
      }
    > {}

export class EthqlBlock implements EthqlBlock {
  public readonly transactions: EthqlTransaction[];

  constructor(block: Block, logs?: Log[]) {
    const { transactions, miner, ...rest } = block;
    Object.assign(this, rest);

    this.miner = new EthqlAccount(block.miner);

    if (logs) {
      const logsByTxIdx = _.groupBy(logs, l => l.transactionIndex);
      this.transactions = transactions.map(tx => new EthqlTransaction(tx, logsByTxIdx[tx.transactionIndex] || []));
    } else {
      this.transactions = transactions.map(tx => new EthqlTransaction(tx));
    }
  }

  /**
   * Returns the number of transactions in this block.
   */
  public transactionCount() {
    return this.transactions.length;
  }
}

export enum StorageObjectType {
  MAP_ADDRESS_KEY,
  MAP_NUMBER_KEY,
  MAP_STRING_KEY,
  ARRAY_FIXED,
  ARRAY_DYNAMIC,
}

export type StorageMapKeyType = 'address' | 'number' | 'string';

export type StorageAccessorElement = {
  selector: string;
  type: StorageObjectType;
};

export class StorageAccessor {
  constructor(public address: string, public readonly path: List<StorageAccessorElement> = List()) {}

  public push(obj: StorageAccessorElement) {
    return new StorageAccessor(this.address, this.path.push(obj));
  }
}

export type TransactionStatus = 'PENDING' | 'SUCCESS' | 'FAILED';
