import net = require('net');
import * as url from 'url';
import Web3 = require('web3');
import { Provider } from 'web3/providers';

interface IMatchers {
  [name: string]: {
    test: (uri: url.UrlWithStringQuery) => boolean;
    provider: (uri: url.UrlWithStringQuery) => Provider;
  };
}

/**
 * Encapsulates the logic to parse JSON-RPC endpoint URLs and to initialize the appropriate web3 provider.
 */
const matchers: IMatchers = {
  IPC: {
    test: uri => !uri.protocol || uri.protocol.startsWith('ipc'),
    provider: uri => new Web3.providers.IpcProvider(uri.path, net),
  },
  'HTTP(S)': {
    test: uri => !!uri.protocol.match(/^https?/),
    provider: uri => new Web3.providers.HttpProvider(url.format(uri)),
  },
  WebSocket: {
    test: uri => !!uri.protocol.match(/^ws/),
    provider: uri => new Web3.providers.WebsocketProvider(url.format(uri)),
  },
};

/**
 * Initializes the web3 client object.
 *
 * @param uri URI of the JSON-RPC endpoint. Supported transports: HTTP(S), WS(S), IPC.
 */
export function initWeb3(uri: string): Web3 {
  if (!uri) {
    throw new Error('Cannot initialize web3 with an empty URI');
  }

  const u = url.parse(uri);
  for (const [name, matcher] of Object.entries(matchers)) {
    if (matcher.test(u)) {
      console.log(`JSON-RPC (web3): Using ${name} provider with endpoint: ${uri}`);
      return new Web3(matcher.provider(u));
    }
  }
  throw new Error(
    'Unsupported web3 provider. Expected a URI with protocols: http, https, ws, wss, ipc, or a filesystem path.',
  );
}
