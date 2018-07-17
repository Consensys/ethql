import { Promise as BPromise } from 'bluebird';
import * as DataLoader from 'dataloader';
import net = require('net');
import * as url from 'url';
import Web3 = require('web3');
import { Provider } from 'web3/providers';
import { Options } from '../config';

interface Matchers {
  [name: string]: {
    test: (uri: url.UrlWithStringQuery) => boolean;
    provider: (uri: url.UrlWithStringQuery) => Provider;
  };
}

/**
 * Encapsulates the logic to parse JSON-RPC endpoint URLs and to initialize the appropriate web3 provider.
 */
const matchers: Matchers = {
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
 * @return A thunk that, when called, returns a web3 instance for the request.
 */
export function initWeb3(config: Options): () => Web3 {
  let web3: Web3;
  const uri = config.jsonrpc;

  if (!uri) {
    throw new Error('Cannot initialize web3 with an empty URI');
  }

  const u = url.parse(uri);
  const matched = Object.entries(matchers).find(([_, matcher]) => matcher.test(u));

  if (!matched) {
    throw new Error(
      'Unsupported web3 provider. Expected a URI with protocols: http, https, ws, wss, ipc, or a filesystem path.',
    );
  }

  const [name, { provider }] = matched;
  console.log(`JSON-RPC (web3): Using ${name} provider with endpoint: ${uri}`);
  web3 = new Web3(provider(u));

  return config.batching ? () => batchingProxy(web3, config) : () => web3;
}

/**
 * Wraps web3 in an ES6 proxy that automatically batches requests using JSON-RPC batching.
 *
 * @param web3 Web3 client.
 */
function batchingProxy(web3: Web3, config: Options): Web3 {
  /**
   * An object that captures an eth call to the web3 library, similar to a thunk,
   * except that it is not a function, hence we call it a _command_.
   *
   * This is the key type of the batch-loading function.
   */
  interface Web3EthCommand {
    cacheKey: string;
    requestFunc: (cb: (err: any, res: any) => void) => any;
  }

  // The dataloader performs the grouping of requests happening in a single tick.
  // Each call to the batch-loading function maps to a JSON-RPC batch request.
  const dataloader = new DataLoader<Web3EthCommand, any>(
    keys => {
      // 1. Create a new JSON-RPC batch.
      const batch = new web3.BatchRequest();

      // 2. The batch variant of the web3 API does not support promises, only callbacks.
      // `fromCallback` injects a virtual callback that wires to a Bluebird Promise.
      // This transforms an original call like web3.eth.getBlock(123) [captured in the command] into
      // web3.eth.getBlock.request(123, cb).
      const promises = keys.map(rq =>
        BPromise.fromCallback(cb => {
          try {
            batch.add(rq.requestFunc(cb));
          } catch (err) {
            cb(err);
          }
        }),
      );

      // 3. Execute the batch. Unfortunately web3 does not return a Promise here, so we have to await
      // the resolution of all inner promises.
      batch.execute();

      // 4. We cannot use naked Promise.all, as a single rejection rejects the entire Promise.
      // Instead, we use Bluebird's inspection to know when all promises are settled, no matter whether
      // with fulfilment or rejection. Note: Promise#reflect() returns a meta-promise that resolves
      // when the underlying promise is settled. By grouping all meta-promises under Promise#all, we can
      // know when the series is fully settled. At that point, we inspect the values and return the value
      // (if fulfilled) or the error (if rejected). The contract of the DataLoader expects the return
      // value of the batch loading function to be Promise<any | error>
      const inspected = promises.map(p => p.reflect());
      const valOrErr = p => (p.isFulfilled() ? p.value() : p.reason());
      return Promise.all(inspected).then(p => p.map(valOrErr));
    },
    {
      cacheKeyFn: (command: Web3EthCommand) => command.cacheKey,
      cache: config.caching,
    },
  );

  const isBatchable = val => val && typeof val.request === 'function';

  // IIFE is used here to seal the scope of eth.
  return (() => {
    // Proxy the web3.eth.Contract objects to wire contract calls to the data loader.
    const contract = new Proxy(web3.eth.Contract, {
      construct: (target, ctorArgs) => {
        const contract = Reflect.construct(target, ctorArgs);
        const address = ctorArgs[ctorArgs.length - 1];
        const methods = new Proxy(contract.methods, {
          get: (obj, prop: string) => {
            return (...callArgs: any[]) => ({
              call: () =>
                dataloader.load({
                  cacheKey: `call:${address}:${prop}/${callArgs.join(':')}`,
                  requestFunc: obj[prop](...callArgs).call.request,
                }),
            });
          },
        });

        // Return the proxified contract instrumenting the methods field.
        return new Proxy(contract, {
          get: (obj, prop) => (prop === 'methods' ? methods : obj[prop]),
        });
      },
    });

    // Proxy the web3.eth object.
    const eth = new Proxy(web3.eth, {
      get: (obj, prop) => {
        if (prop === 'Contract') {
          return contract;
        }
        // pass-through if the property doesn't exist, or if the method is not batchable.
        return !isBatchable(obj[prop])
          ? obj[prop]
          : (...args: any[]) => {
              // For all arguments that are objects, transform to JSON and run the sha3; else use its value.
              const argsKey = args.map(a => (typeof a === 'object' ? web3.utils.sha3(JSON.stringify(a)) : a)).join(':');
              return dataloader.load({
                cacheKey: `${prop.toString()}/${argsKey}`,
                requestFunc: cb => obj[prop].request(...args, cb),
              });
            };
      },
    });

    // Proxy web3 to return the eth proxy.
    return new Proxy(web3, {
      get: (obj, prop) => (prop === 'eth' ? eth : obj[prop]),
    });
  })();
}
