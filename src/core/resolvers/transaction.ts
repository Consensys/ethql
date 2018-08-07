import { GraphQLResolveInfo } from 'graphql';
import { EthqlContext } from '../../context';
import { DecodedTransaction } from '../../dec/types';
import { EthqlAccount, EthqlBlock, EthqlLog, EthqlTransaction, TransactionStatus } from '../model';

async function logs(obj: EthqlTransaction, args, { ethService }: EthqlContext): Promise<EthqlLog[]> {
  return obj.logs || ethService.fetchTransactionLogs(obj);
}

function decoded(obj: EthqlTransaction, args, context: EthqlContext): DecodedTransaction {
  return obj.inputData && obj.inputData !== '0x' ? context.decodingEngine.decodeTransaction(obj, context) : null;
}

async function block(
  obj: EthqlTransaction,
  args,
  { ethService }: EthqlContext,
  info: GraphQLResolveInfo,
): Promise<EthqlBlock> {
  return obj.blockNumber ? ethService.fetchBlock(obj.blockNumber, info) : null;
}

async function status(obj: EthqlTransaction, args, { ethService }: EthqlContext): Promise<TransactionStatus> {
  return ethService.fetchTransactionStatus(obj);
}

async function createdContract(obj: EthqlTransaction, args, { ethService }: EthqlContext): Promise<EthqlAccount> {
  return ethService.fetchCreatedContract(obj);
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
