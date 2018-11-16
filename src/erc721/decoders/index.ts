import { EthqlContext } from '../../context';
import { EthqlAccount, EthqlTransaction } from '../../core/model';
import { createAbiDecoder, DecoderDefinition, extractParamValue } from '../../core/services/decoder';
import {
  ERC721ApprovalEvent,
  ERC721ApprovalForAllEvent,
  ERC721Approve,
  Erc721SafeTransferFrom,
  ERC721SetApprovalForAll,
  Erc721TokenContract,
  Erc721TokenHolder,
  ERC721TransferEvent,
  Erc721TransferFrom,
} from '../model';

type Erc721LogBindings = {
  Approval: ERC721ApprovalEvent;
  ApprovalForAll: ERC721ApprovalForAllEvent;
  Transfer: ERC721TransferEvent;
};

type Erc721TxBindings = {
  transferFrom: Erc721TransferFrom;
  safeTransferFrom: Erc721SafeTransferFrom;
  approve: ERC721Approve;
  setApprovalForAll: ERC721SetApprovalForAll;
};

const transferFrom = (decoded: any, tx: EthqlTransaction, context: EthqlContext) => {
  const tokenContract = new Erc721TokenContract(tx.to, context);
  const to = new EthqlAccount(extractParamValue(decoded.params, '_to'));

  return {
    tokenContract,
    from: new Erc721TokenHolder(tx.from, tokenContract),
    to: new Erc721TokenHolder(to, tokenContract),
    tokenId: extractParamValue(decoded.params, '_tokenId'),
  };
};

const approve = (decoded: any, tx: EthqlTransaction, context: EthqlContext) => {
  const tokenContract = new Erc721TokenContract(tx.to, context);
  const approved = new EthqlAccount(extractParamValue(decoded.params, '_approved'));

  return {
    tokenContract,
    approved: new Erc721TokenHolder(approved, tokenContract),
    tokenId: extractParamValue(decoded.params, '_tokenId'),
  };
};

const setApprovalForAll = (decoded: any, tx: EthqlTransaction, context: EthqlContext) => {
  const tokenContract = new Erc721TokenContract(tx.to, context);
  const operator = new EthqlAccount(extractParamValue(decoded.params, '_operator'));

  return {
    tokenContract,
    operator: new Erc721TokenHolder(operator, tokenContract),
    approved: extractParamValue(decoded.params, '_approved'),
  };
};

/**
 * ERC721 token transaction decoder.
 */
class Erc721TokenDecoder implements DecoderDefinition<Erc721TxBindings, Erc721LogBindings> {
  public readonly entity = 'token';
  public readonly standard = 'ERC721';
  public readonly abiDecoder = createAbiDecoder(__dirname + '../../../abi/erc721.json');

  public readonly txTransformers = {
    transferFrom,
    safeTransferFrom: transferFrom,
    approve,
    setApprovalForAll,
  };

  public readonly logTransformers = {
    Approval: (decoded: any, tx: EthqlTransaction, context: EthqlContext): ERC721ApprovalEvent => {
      const tokenContract = new Erc721TokenContract(tx.to, context);
      const owner = new EthqlAccount(extractParamValue(decoded.events, '_owner'));
      const approved = new EthqlAccount(extractParamValue(decoded.events, '_approved'));

      return {
        owner: new Erc721TokenHolder(owner, tokenContract),
        approved: new Erc721TokenHolder(approved, tokenContract),
        tokenId: extractParamValue(decoded.events, '_tokenId'),
      };
    },

    ApprovalForAll: (decoded: any, tx: EthqlTransaction, context: EthqlContext): ERC721ApprovalForAllEvent => {
      const tokenContract = new Erc721TokenContract(tx.to, context);
      const owner = new EthqlAccount(extractParamValue(decoded.events, '_owner'));
      const operator = new EthqlAccount(extractParamValue(decoded.events, '_operator'));

      return {
        owner: new Erc721TokenHolder(owner, tokenContract),
        operator: new Erc721TokenHolder(operator, tokenContract),
        approved: extractParamValue(decoded.events, '_approved'),
      };
    },

    Transfer: (decoded: any, tx: EthqlTransaction, context: EthqlContext): ERC721TransferEvent => {
      const tokenContract = new Erc721TokenContract(tx.to, context);
      const from = new EthqlAccount(extractParamValue(decoded.events, '_from'));
      const to = new EthqlAccount(extractParamValue(decoded.events, '_to'));

      return {
        from: new Erc721TokenHolder(from, tokenContract),
        to: new Erc721TokenHolder(to, tokenContract),
        tokenId: extractParamValue(decoded.events, '_tokenId'),
      };
    },
  };
}

export { Erc721TokenDecoder };
