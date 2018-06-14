import config from './config';
import EthqlContext from './model/EthqlContext';
import { initWeb3 } from './providers/web3';
import { initSchema } from './schema';
import { startServer, stopServer } from './server';
import txDecodingEngine from './txdec';

process.on('SIGINT', async () => (await stopServer()) || process.exit(0));
process.on('SIGTERM', async () => (await stopServer()) || process.exit(0));

const web3 = initWeb3(config.jsonrpc);
const context = new EthqlContext(web3, config, txDecodingEngine);
const schema = initSchema(context);

startServer(schema, context);
