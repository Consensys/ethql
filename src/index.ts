import schema from './schema';
import { startServer, stopServer } from './server';

async function start() {
  startServer(schema);
}

async function shutdown() {
  await stopServer();
}

process.on('SIGINT', () => shutdown() || process.exit(0));
process.on('SIGTERM', () => shutdown() || process.exit(0));

start();
