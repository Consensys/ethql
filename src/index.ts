import config from './config';
import { initWeb3 } from './providers/web3';
import { initSchema } from './schema';
import { startServer, stopServer } from './server';

process.on('SIGINT', async () => (await stopServer()) || process.exit(0));
process.on('SIGTERM', async () => (await stopServer()) || process.exit(0));

const web3 = initWeb3(config.jsonrpc);
const schema = initSchema(web3, config);
startServer(schema);
