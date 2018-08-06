import { GraphQLResolveInfo } from 'graphql';
import { EthqlContext } from '../../context';
import { DecodedTransaction } from '../../dec/types';
import { EthqlAccount, EthqlBlock, EthqlLog, EthqlTransaction, TransactionStatus } from '../model';

async function logs(obj: EthqlTransaction, args, { web3 }: EthqlContext): Promise<EthqlLog[]> {
  return (
    obj.logs ||
    (async () => {
      const receipt = await web3.eth.getTransactionReceipt(obj.hash);
      return receipt ? (obj.logs = receipt.logs.map(l => new EthqlLog(l, obj))) : null;
    })()
  );
}

function decoded(obj: EthqlTransaction, _, context: EthqlContext): DecodedTransaction {
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

async function status(obj: EthqlTransaction, args, context: EthqlContext): Promise<TransactionStatus> {
  const receipt = await context.web3.eth.getTransactionReceipt(obj.hash);
  if (!receipt) {
    return 'PENDING';
  }
  return receipt.status === undefined ? null : receipt.status ? 'SUCCESS' : 'FAILED';
}

async function createdContract(obj: EthqlTransaction, args, context: EthqlContext): Promise<EthqlAccount> {
  return obj.to.address === null
    ? new EthqlAccount((await context.web3.eth.getTransactionReceipt(obj.hash)).contractAddress)
    : null;
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
