interface JsonRpcRequest {
  jsonrpc: string;
  method: string;
  params: any[];
  id: number;
}

interface JsonRpcResponse {
  jsonrpc: string;
  id: number;
  result?: any;
  error?: string;
}

export class Provider {
  public send(
    payload: JsonRpcRequest | JsonRpcRequest[],
    callback: (e: Error, val: JsonRpcResponse | JsonRpcResponse[]) => void,
  ): any;
}

export class WebsocketProvider extends Provider {
  public responseCallbacks: object;
  public notificationCallbacks: [() => any];
  public connection: {
    onclose(e: any): void;
    onmessage(e: any): void;
    onerror(e?: any): void;
  };
  public addDefaultEvents: () => void;
  public on(type: string, callback: () => any): void;
  public removeListener(type: string, callback: () => any): void;
  public removeAllListeners(type: string): void;
  public reset(): void;
}
export class HttpProvider extends Provider {
  public responseCallbacks: undefined;
  public notificationCallbacks: undefined;
  public connection: undefined;
  public addDefaultEvents: undefined;
  public on(type: string, callback: () => any): undefined;
  public removeListener(type: string, callback: () => any): undefined;
  public removeAllListeners(type: string): undefined;
  public reset(): undefined;
}
export class IpcProvider extends Provider {
  public responseCallbacks: undefined;
  public notificationCallbacks: undefined;
  public connection: undefined;
  public addDefaultEvents: undefined;
  public on(type: string, callback: () => any): undefined;
  public removeListener(type: string, callback: () => any): undefined;
  public removeAllListeners(type: string): undefined;
  public reset(): undefined;
}

export default interface Providers {
  WebsocketProvider: new (host: string, timeout?: number) => WebsocketProvider;
  HttpProvider: new (host: string, timeout?: number) => HttpProvider;
  IpcProvider: new (path: string, net: any) => IpcProvider;
}
