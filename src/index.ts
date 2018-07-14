import config from './config';
import decodingEngine from './dec';
import { EthqlContextFactory } from './model/EthqlContext';
import { initWeb3 } from './providers/web3';
import { initSchema } from './schema';
import { startServer, stopServer } from './server';

process.on('SIGINT', async () => (await stopServer()) || process.exit(0));
process.on('SIGTERM', async () => (await stopServer()) || process.exit(0));

console.log(`Effective configuration:\n${JSON.stringify(config, null, 2)}`);

const web3 = initWeb3(config);
const context = new EthqlContextFactory(web3, config, decodingEngine);
const schema = initSchema(context);

startServer(schema, context);
