import * as fs from 'fs';
import { graphql } from 'graphql';
import * as _ from 'lodash';
import * as path from 'path';
import { promisify } from 'util';
import Web3 = require('web3');
import { JsonRpcRequest, JsonRpcResponse, Provider } from 'web3/providers';
import { Options } from '../config';
import { EthqlContext, EthqlContextFactory } from '../context';
import { initSchema } from '../core';
import decodingEngine from '../dec';
import { initWeb3 } from '../providers/web3';

const { sha3 } = new Web3().utils;

/**
 * Default ethql options.
 */
const options: Options = {
  jsonrpc: 'https://mainnet.infura.io',
  queryMaxSize: 10,
  batching: true,
  caching: true,
};

/**
 * Function that ensures that the test data directory exists.
 */
const ensureDataDir = () => {
  const dataDir = path.join(__dirname, 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
  }
};

/**
 * Computes the filename of the cache entry.
 *
 * @param rq The JSON RPC Request being dispatched by the Web3 provider.
 */
const computeFilename = (rq: JsonRpcRequest) => {
  let params;

  //tslint:disable-next-line
  if (rq.method === 'eth_call') {
    params = sha3(JSON.stringify(rq.params[0]));
  } else {
    params = rq.params.map(a => (typeof a === 'object' ? sha3(JSON.stringify(a)) : a)).join('__');
  }

  return `${rq.method}_${params}.json`;
};

/**
 * A Web3 provider that delegates onto another one, recording all traffic into files, whose filenames are
 * determined by the `computeFilename` function.
 */
class RecordingProvider implements Provider {
  constructor(private delegate: Provider) {}

  public send(
    payload: JsonRpcRequest | JsonRpcRequest[],
    cb: (e: Error, val: JsonRpcResponse | JsonRpcResponse[]) => void,
  ): any {
    // Compute the filenames for these requests.
    const keys = (payload instanceof Array ? payload : [payload]).map(computeFilename);

    // This callback stores the received response(s) in their corresponding files (one per request, splitting JSON-RPC batches).
    const callback = (err, res) => {
      const calls = _.fromPairs(_.zip(keys, res instanceof Array ? res : [res]));
      for (let [filename, payload] of Object.entries(calls)) {
        fs.writeFileSync(path.join(__dirname, 'data', filename), JSON.stringify(payload, null, 2));
      }

      // Call the original callback.
      cb(err, res);
    };

    // Delegate onto the wrapped Provider, probably an HttpProvider, but not compulsory.
    return this.delegate.send(payload, callback);
  }
}

/**
 * A Web3 provider that attempts to respond from our filesystem cache, only dispatching the request to the
 * original provider if the cache entry was not found. In the case of batches, if one entry is not found
 * the whole request is sent.
 */
class ReplayingProvider implements Provider {
  private static readFile = promisify(fs.readFile);

  constructor(private delegate: Provider) {}

  public send(
    payload: JsonRpcRequest | JsonRpcRequest[],
    cb: (e: Error, val: JsonRpcResponse | JsonRpcResponse[]) => void,
  ): any {
    const isBatch = payload instanceof Array;
    // This repetition is necessary for TS to infer types.
    const rqs = payload instanceof Array ? (payload as JsonRpcRequest[]) : [payload];
    // Compute the filenames corresponding to each request.
    const keys = rqs.map(computeFilename);
    // Remember the original request IDs, to overwrite them in the responses. Otherwise the web3 BatchManager
    // won't be able to correlate.
    const reqIds = rqs.map(rq => rq.id);

    // Only respond from cache if all keys are present; otherwise passthrough entirely.
    // 1. Load the cached response from the file. If it could not be loaded, the `catch` will trigger and
    // we'll fallback to the original provider.
    // 2. Parse file contents as JSON.
    // 3. Overwrite the id of the response.
    // 4. Call the callback with the cached results.
    // 5. If a cache entry is not found, switch to record mode only for this request.
    Promise.all(keys.map(filename => ReplayingProvider.readFile(path.join(__dirname, 'data', filename)))) //
      .then(buffs => buffs.map(buf => JSON.parse(buf.toString('utf-8'))))
      .then(resps => resps.map((r, idx) => _.set(r, 'id', reqIds[idx])))
      .then(vals => cb(null, isBatch ? (vals as JsonRpcResponse[]) : (vals[0] as JsonRpcResponse)))
      .catch(_ => new RecordingProvider(this.delegate).send(payload, cb));
  }
}

const testMode = (process.env.ETHQL_TEST_MODE || '').toLowerCase().trim();

export enum TestMode {
  'record',
  'replay',
  'passthrough',
}

/**
 * Test runner options.
 */
export type TestOptions = {
  configOverride?: Options;
  mode?: TestMode;
};

const defaultTestOptions: TestOptions = {
  configOverride: {},
  mode: testMode in TestMode ? TestMode[testMode] : TestMode.replay,
};

/**
 * Instantiates a test GraphQL schema.
 *
 * @param testOptions Options for the test runner.
 */
export function testGraphql(testOptions: TestOptions = defaultTestOptions) {
  const { configOverride, mode } = testOptions;
  if (mode === TestMode.record || mode === TestMode.replay) {
    ensureDataDir();
  }

  const config = _.merge({}, options, configOverride || {});
  const _factory = initWeb3(config);

  const web3Factory = () => {
    const w3 = _factory();
    w3.currentProvider =
      mode === TestMode.record
        ? new RecordingProvider(w3.currentProvider)
        : mode === TestMode.replay
          ? new ReplayingProvider(w3.currentProvider)
          : w3.currentProvider;
    return w3;
  };

  const ctxFactory = new EthqlContextFactory(web3Factory, config, decodingEngine);
  const schema = initSchema();
  const prepareContext = () => ctxFactory.create();

  const execQuery = (query: string, context?: EthqlContext, variables?: { [key: string]: any }) => {
    return graphql(schema, query, {}, context || prepareContext(), variables);
  };

  return { schema, prepareContext, execQuery, ctxFactory };
}
