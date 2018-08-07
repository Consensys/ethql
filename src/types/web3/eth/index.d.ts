import BigNumber = require('bn.js');
import PromiEvent from '../promiEvent';
import { Provider } from '../providers';
import { Callback, EncodedTransaction, Log, Logs, Subscribe, TransactionReceipt } from '../types';
import ABI from './abi';
import Accounts from './accounts';
import Contract, { CustomOptions as CustomContractOptions } from './contract';
import {
  BatchRequest,
  Block,
  BlockHeader,
  BlockType,
  CompileResult,
  Iban,
  Net,
  Personal,
  Transaction,
  Tx,
} from './types';

/* tslint:disable:member-ordering */
type GetPastLogsOpts = {
  fromBlock?: BlockType;
  toBlock?: BlockType;
  address?: string;
  topics?: Array<string | string[]>;
};

export default interface Eth {
  defaultAccount: string;
  defaultBlock: BlockType;
  BatchRequest: new () => BatchRequest;
  Iban: Iban;
  Contract: new (jsonInterface: any[], address?: string, options?: CustomContractOptions) => Contract;
  abi: ABI;
  setProvider: (provider: Provider) => void;
  accounts: Accounts;
  call(callObject: Tx, defaultBlock?: BlockType, callBack?: Callback<string>): Promise<string>;
  clearSubscriptions(): boolean;
  subscribe(type: 'logs', options?: Logs, callback?: Callback<Subscribe<Log>>): Promise<Subscribe<Log>>;
  subscribe(type: 'syncing', callback?: Callback<Subscribe<any>>): Promise<Subscribe<any>>;
  subscribe(type: 'newBlockHeaders', callback?: Callback<Subscribe<BlockHeader>>): Promise<Subscribe<BlockHeader>>;
  subscribe(type: 'pendingTransactions', callback?: Callback<Subscribe<Transaction>>): Promise<Subscribe<Transaction>>;
  subscribe(
    type: 'pendingTransactions' | 'newBlockHeaders' | 'syncing' | 'logs',
    options?: Logs,
    callback?: Callback<Subscribe<any>>,
  ): Promise<Subscribe<any>>;

  unsubscribe(callBack: Callback<boolean>): void | boolean;
  compile: {
    solidity(source: string, callback?: Callback<CompileResult>): Promise<CompileResult>;
    lll(source: string, callback?: Callback<CompileResult>): Promise<CompileResult>;
    serpent(source: string, callback?: Callback<CompileResult>): Promise<CompileResult>;
  };
  currentProvider: Provider;
  estimateGas(tx: Tx, callback?: Callback<number>): Promise<number>;

  getAccounts(cb?: Callback<string[]>): Promise<string[]>;

  getBalance: {
    (address: string, defaultBlock?: BlockType, cb?: Callback<number>): Promise<number>;
    request(address: string, defaultBlock?: BlockType, cb?: Callback<number>): object;
  };

  getBlock: {
    (blockNumber: BlockType, returnTransactionObjects?: boolean, cb?: Callback<Block>): Promise<Block>;
    request(blockNumber: BlockType, returnTransactionObjects?: boolean, cb?: Callback<Block>): object;
  };

  getBlockNumber: {
    (callback?: Callback<number>): Promise<number>;
    request(callback?: Callback<number>): object;
  };

  getBlockTransactionCount: {
    (blockNumber: BlockType, cb?: Callback<number>): Promise<number>;
    request(blockNumber: BlockType, cb?: Callback<number>): object;
  };

  getBlockUncleCount: {
    (blockNumber: BlockType, cb?: Callback<number>): Promise<number>;
    request(blockNumber: BlockType, cb?: Callback<number>): object;
  };

  getCode: {
    (address: string, defaultBlock?: BlockType, cb?: Callback<string>): Promise<string>;
    request(address: string, defaultBlock?: BlockType, cb?: Callback<string>): object;
  };

  getCoinbase: {
    (cb?: Callback<string>): Promise<string>;
    request(cb?: Callback<string>): object;
  };

  getCompilers(cb?: Callback<string[]>): Promise<string[]>;
  getGasPrice: {
    (cb?: Callback<number>): Promise<number>;
    request(cb?: Callback<number>): object;
  };
  getHashrate: {
    (cb?: Callback<number>): Promise<number>;
    request(cb?: Callback<number>): object;
  };

  getPastLogs: {
    (options: GetPastLogsOpts, cb?: Callback<Log[]>): Promise<Log[]>;
    request(options: GetPastLogsOpts, cb?: Callback<Log[]>): object;
  };

  getProtocolVersion: {
    (cb?: Callback<string>): Promise<string>;
    request(cb?: Callback<string>): object;
  };

  getStorageAt: {
    (address: string, position: number, defaultBlock?: BlockType, cb?: Callback<string>): Promise<string>;
    request(address: string, position: number, defaultBlock?: BlockType, cb?: Callback<string>): object;
  };

  getTransactionReceipt: {
    (hash: string, cb?: Callback<TransactionReceipt>): Promise<TransactionReceipt>;
    request(hash: string, cb?: Callback<TransactionReceipt>): object;
  };

  getTransaction: {
    (hash: string, cb?: Callback<Transaction>): Promise<Transaction>;
    request(hash: string, cb?: Callback<Transaction>): object;
  };

  getTransactionCount: {
    (address: string, defaultBlock?: BlockType, cb?: Callback<number>): Promise<number>;
    request(address: string, defaultBlock?: BlockType, cb?: Callback<number>): object;
  };

  getTransactionFromBlock: {
    (block: BlockType, index: number, cb?: Callback<Transaction>): Promise<Transaction>;
    request(block: BlockType, index: number, cb?: Callback<Transaction>): object;
  };

  getUncle: {
    (block: BlockType, uncleIndex: number, returnTransactionObjects?: boolean, cb?: Callback<Block>): Promise<Block>;
    request(block: BlockType, uncleIndex: number, returnTransactionObjects?: boolean, cb?: Callback<Block>): object;
  };

  getWork(cb?: Callback<string[]>): Promise<string[]>;
  givenProvider: Provider;
  isMining(cb?: Callback<boolean>): Promise<boolean>;
  isSyncing: {
    (cb?: Callback<boolean>): Promise<boolean>;
    request(cb?: Callback<boolean>): object;
  };
  net: Net;
  personal: Personal;
  signTransaction(tx: Tx, address?: string, cb?: Callback<string>): Promise<EncodedTransaction>;
  sendSignedTransaction(data: string, cb?: Callback<string>): PromiEvent<TransactionReceipt>;
  sendTransaction(tx: Tx, cb?: Callback<string>): PromiEvent<TransactionReceipt>;
  submitWork(nonce: string, powHash: string, digest: string, cb?: Callback<boolean>): Promise<boolean>;
  sign(address: string, dataToSign: string, cb?: Callback<string>): Promise<string>;
}
