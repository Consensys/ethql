import Web3 = require('web3');

const http = new Web3.providers.HttpProvider(`https://mainnet.infura.io/${process.env.INFURA_ID}`);
export const web3 = new Web3(http);
