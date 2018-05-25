import { DecodedMethod, DecodedParam } from 'abi-decoder';
import { GraphQLTypeResolver } from 'graphql';
import { IFieldResolver, IResolvers } from 'graphql-tools';
import { web3 } from '../providers/web3';

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
    decoder: abiDecoder('../../abi/erc20.json').decodeMethod,
    transformer: (decoded: DecodedMethod) => {
      return {
        type: 'erc20',
        action: decoded.name,
        to: extractParamValue(decoded.params, 'to'),
        value: extractParamValue(decoded.params, 'value'),
      };
    },
  },
};

const decodeTransaction: IFieldResolver<any, any> = ({ inputData }, args) => {
  if (!inputData || inputData === '0x') {
    return;
  }
  for (const [type, { decoder, transformer }] of Object.entries(processors)) {
    const decoded = decoder(inputData);
    if (decoded) {
      const transformed = transformer(decoded);
      return { ...transformed, type };
    }
  }
};

const resolveTransactionType: GraphQLTypeResolver<any, any> = ({ type }, context, info) => type;

const resolvers: IResolvers = {
  Transaction: {
    decoded: decodeTransaction,
  },
  DecodedTransaction: {
    __resolveType: resolveTransactionType,
  },
};

export default resolvers;
