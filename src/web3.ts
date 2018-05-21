import * as Web3 from 'web3';

export const web3: Web3 = new Web3(
  new Web3.providers.HttpProvider(`https://mainnet.infura.io/${process.env.INFURA_ID}`),
);
