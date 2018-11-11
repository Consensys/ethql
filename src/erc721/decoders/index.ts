import { EthqlContext } from '../../context';
import { EthqlAccount, EthqlTransaction } from '../../core/model';
import { createAbiDecoder, DecoderDefinition, extractParamValue } from '../../core/services/decoder';
import {
  ERC721ApprovalEvent,
  ERC721ApprovalForAllEvent,
  Erc721SafeTransferFrom,
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
};

const transfer = (decoded: any, tx: EthqlTransaction, context: EthqlContext) => {
  const tokenContract = new Erc721TokenContract(tx.to, context);
  const to = new EthqlAccount(extractParamValue(decoded.params, 'to'));
  return {
    tokenContract,
    from: new Erc721TokenHolder(tx.from, tokenContract),
    tokenId: extractParamValue(decoded.params, 'tokenId'),
    to: new Erc721TokenHolder(to, tokenContract),
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
    transferFrom: transfer,

    safeTransferFrom: transfer,
  };

  public readonly logTransformers = {
    Approval: (decoded: any, tx: EthqlTransaction, context: EthqlContext): ERC721ApprovalEvent => {
      const tokenContract = new Erc721TokenContract(tx.to, context);
      const owner = new EthqlAccount(extractParamValue(decoded.events, 'owner'));
      const approved = new EthqlAccount(extractParamValue(decoded.events, 'approved'));

      return {
        owner: new Erc721TokenHolder(owner, tokenContract),
        approved: new Erc721TokenHolder(approved, tokenContract),
        tokenId: extractParamValue(decoded.events, 'tokenId'),
      };
    },

    ApprovalForAll: (decoded: any, tx: EthqlTransaction, context: EthqlContext): ERC721ApprovalForAllEvent => {
      const tokenContract = new Erc721TokenContract(tx.to, context);
      const owner = new EthqlAccount(extractParamValue(decoded.events, 'owner'));
      const operator = new EthqlAccount(extractParamValue(decoded.events, 'operator'));

      return {
        owner: new Erc721TokenHolder(owner, tokenContract),
        operator: new Erc721TokenHolder(operator, tokenContract),
        approved: extractParamValue(decoded.events, 'approved'),
      };
    },

    Transfer: (decoded: any, tx: EthqlTransaction, context: EthqlContext): ERC721TransferEvent => {
      const tokenContract = new Erc721TokenContract(tx.to, context);
      const from = new EthqlAccount(extractParamValue(decoded.events, 'from'));
      const to = new EthqlAccount(extractParamValue(decoded.events, 'to'));

      return {
        from: new Erc721TokenHolder(from, tokenContract),
        to: new Erc721TokenHolder(to, tokenContract),
        tokenId: extractParamValue(decoded.events, 'tokenId'),
      };
    },
  };
}

export { Erc721TokenDecoder };
