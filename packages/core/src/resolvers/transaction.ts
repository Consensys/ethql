import { EthqlContext } from '@ethql/base';
import * as Debug from 'debug';
import { GraphQLResolveInfo } from 'graphql';
import { EthqlAccount, EthqlBlock, EthqlLog, EthqlTransaction, TransactionStatus } from '../model';
import { DecodedTransaction } from '../services/decoder';

const debug = Debug.debug('ethql:tx-resolve');
async function logs(obj: EthqlTransaction, args, { services }: EthqlContext): Promise<EthqlLog[]> {
  debug('obj: %O', obj);
  debug('args: %O', args);
  return obj.logs || services.eth.fetchTransactionLogs(obj, args.filter);
}

function decoded(obj: EthqlTransaction, args, context: EthqlContext): DecodedTransaction {
  return obj.inputData && obj.inputData !== '0x' ? context.services.decoder.decodeTransaction(obj, context) : null;
}

async function block(
  obj: EthqlTransaction,
  args,
  { services }: EthqlContext,
  info: GraphQLResolveInfo,
): Promise<EthqlBlock> {
  return obj.blockNumber ? services.eth.fetchBlock(obj.blockNumber, info) : null;
}

async function status(obj: EthqlTransaction, args, { services }: EthqlContext): Promise<TransactionStatus> {
  return services.eth.fetchTransactionStatus(obj);
}

async function createdContract(obj: EthqlTransaction, args, { services }: EthqlContext): Promise<EthqlAccount> {
  return services.eth.fetchCreatedContract(obj);
}

export default {
  Transaction: {
    logs,
    decoded,
    block,
    status,
    createdContract,
  },
};
