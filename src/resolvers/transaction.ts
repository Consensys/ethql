import { DecodedMethod, DecodedParam } from 'abi-decoder';
import { IFieldResolver, IResolvers } from 'graphql-tools';
import * as _ from 'lodash';
import Web3 = require('web3');

function abiDecoder(path: string) {
  const decoder = require('abi-decoder');
  decoder.addABI(require(path));
  return decoder;
}

const extractParamValue = (params: [DecodedParam], name: string) => {
  if (Array.isArray(params) && params.length >= 0) {
    const param = params.find(p => name === p.name);
    return param && param.value;
  }
};

const processors = {
  Erc20Transaction: {
    decoder: abiDecoder('../abi/erc20.json').decodeMethod,
    transformer: (decoded: DecodedMethod, transaction) => {
      const func = decoded.name;
      const asAccount = address => ({ address });
      let answer: any = {
        standard: 'ERC20',
        operation: func,
        type: 'ERC20' + _.capitalize(func),
        from: transaction.from,
        to: asAccount(extractParamValue(decoded.params, 'to')),
        value: extractParamValue(decoded.params, 'value'),
      };

      if (func === 'approve') {
        answer.spender = asAccount(extractParamValue(decoded.params, 'spender'));
      } else if (func === 'transferFrom') {
        answer.spender = transaction.from;
        answer.from = extractParamValue(decoded.params, 'from');
      }
      return answer;
    },
  },
};

const decodeTransaction: IFieldResolver<any, any> = (transaction, args) => {
  const { inputData } = transaction;
  if (!inputData || inputData === '0x') {
    return;
  }
  for (const [c, { decoder, transformer }] of Object.entries(processors)) {
    const decoded = decoder(inputData);
    if (decoded) {
      return transformer(decoded, transaction);
    }
  }
};

export default function(web3: Web3): IResolvers {
  return {
    Query: {
      transaction(obj, { hash }) {
        return web3.eth.getTransaction(hash);
      },
    },
    Transaction: {
      decoded: decodeTransaction,
    },
    DecodedTransaction: {
      __resolveType: ({ type }) => type,
    },
  };
}
