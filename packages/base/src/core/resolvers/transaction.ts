import { GraphQLResolveInfo } from 'graphql';
import { EthqlContext } from '../../context';
import { EthqlAccount, EthqlBlock, EthqlLog, EthqlTransaction, TransactionStatus } from '../model';
import { DecodedTransaction } from '../services/decoder';

async function logs(obj: EthqlTransaction, args, { services }: EthqlContext): Promise<EthqlLog[]> {
  return obj.logs || services.ethService.fetchTransactionLogs(obj);
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
  return obj.blockNumber ? services.ethService.fetchBlock(obj.blockNumber, info) : null;
}

async function status(obj: EthqlTransaction, args, { services }: EthqlContext): Promise<TransactionStatus> {
  return services.ethService.fetchTransactionStatus(obj);
}

async function createdContract(obj: EthqlTransaction, args, { services }: EthqlContext): Promise<EthqlAccount> {
  return services.ethService.fetchCreatedContract(obj);
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
