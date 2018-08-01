import config from './config';
import decodingEngine from './dec';
import { EthqlContextFactory } from './model/EthqlContext';
import { initWeb3 } from './providers/web3';
import { initSchema } from './schema';
import { EthqlServer } from './server';

console.log(`Effective configuration:\n${JSON.stringify(config, null, 2)}`);

const web3 = initWeb3(config);
const contextFactory = new EthqlContextFactory(web3, config, decodingEngine);
const schema = initSchema(contextFactory);

const server = new EthqlServer(schema, contextFactory);

process.on('SIGINT', async () => (await server.stop()) || process.exit(0));
process.on('SIGTERM', async () => (await server.stop()) || process.exit(0));

server.start();
