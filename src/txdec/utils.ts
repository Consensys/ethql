/**
 *
 * @param params
 * @param name
 */
export function extractParamValue(params: [any], name: string) {
  if (Array.isArray(params) && params.length >= 0) {
    const param = params.find(p => name === p.name);
    return param && param.value;
  }
}

export function createAbiDecoder(path: string) {
  const decoder = require('abi-decoder');
  decoder.addABI(require(path));
  return decoder.decodeMethod;
}
