declare module 'abi-decoder' {
  export interface DecodedParam {
    name: string;
    value: any;
    type: string;
  }
  export interface DecodedMethod {
    name: string;
    params: [DecodedParam];
  }

  export function getABIs(): [any];
  export function addABI(abi: any);
  export function getMethodIDs();
  export function decodeMethod(input: string): DecodedMethod;
  export function decodeLogs();
  export function removeABI();
}
