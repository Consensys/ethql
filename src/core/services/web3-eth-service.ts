import { GraphQLResolveInfo } from 'graphql';
import Web3 = require('web3');
import { EthqlAccount, EthqlBlock, EthqlLog, EthqlTransaction, TransactionStatus } from '../model';
import { EthService, fetchHints, FetchHints } from './eth-service';

export class Web3EthService implements EthService {
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

  public async fetchTransactionLogs(tx: EthqlTransaction): Promise<EthqlLog[]> {
    const receipt = await this.web3.eth.getTransactionReceipt(tx.hash);
    return receipt && (tx.logs = receipt.logs.map(l => new EthqlLog(l, tx)));
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
