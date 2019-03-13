import BigNumber = require('bn.js');
import * as us from 'underscore';

type Unit =
  | 'kwei'
  | 'femtoether'
  | 'babbage'
  | 'mwei'
  | 'picoether'
  | 'lovelace'
  | 'gwei'
  | 'nanoether'
  | 'shannon'
  | 'microether'
  | 'szabo'
  | 'nano'
  | 'micro'
  | 'milliether'
  | 'finney'
  | 'milli'
  | 'ether'
  | 'kether'
  | 'grand'
  | 'mether'
  | 'gether'
  | 'tether';

// TODO: Work around a typescript bug that surfaced when web3 took away statics.
// Ref: https://github.com/ethereum/web3.js/issues/2350
export class BN extends BigNumber {
  constructor(number: number | string | number[] | Buffer | BN, base?: number | 'hex', endian?: 'le' | 'be');
}

export default interface Utils {
  BN: BN; // TODO only static-definition
  _: us.UnderscoreStatic;
  unitMap: any;
  isBN(val: any): boolean;
  isBigNumber(val: any): boolean;
  isAddress(val: any): boolean;
  isHex(val: any): boolean;
  isHexStrict(val: any): boolean;
  asciiToHex(val: string): string;
  hexToAscii(val: string): string;
  bytesToHex(val: number[]): string;
  numberToHex(val: number | BigNumber): string;
  checkAddressChecksum(address: string): boolean;
  fromAscii(val: string): string;
  fromDecimal(val: string | number | BigNumber): string;
  fromUtf8(val: string): string;
  fromWei(val: BigNumber, unit: Unit): BigNumber;
  fromWei(val: string | number, unit: Unit): string;
  hexToBytes(val: string): number[];
  hexToNumber(val: string | number | BigNumber): number;
  hexToNumberString(val: string | number | BigNumber): string;
  hexToString(val: string): string;
  hexToUtf8(val: string): string;
  keccak256(val: string): string;
  leftPad(string: string, chars: number, sign: string): string;
  padLeft(string: string, chars: number, sign: string): string;
  rightPad(string: string, chars: number, sign: string): string;
  padRight(string: string, chars: number, sign: string): string;
  sha3(val: string, val2?: string, val3?: string, val4?: string, val5?: string): string;
  soliditySha3(val: string): string;
  randomHex(bytes: number): string;
  stringToHex(val: string): string;
  toAscii(hex: string): string;
  toBN(val: any): BigNumber;
  toChecksumAddress(val: string): string;
  toDecimal(val: any): number;
  toHex(val: any): string;
  toUtf8(val: any): string;
  toWei(val: BigNumber, unit: Unit): string | BigNumber;
  toWei(val: string | number, unit: Unit): string;
}
