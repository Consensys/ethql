import { IResolvers } from 'graphql-tools';
import * as _ from 'lodash';
import Web3 = require('web3');
import { Options } from '../config';
import accountResolvers from './account';
import blockResolvers from './block';
import scalarResolvers from './scalars';
import txResolvers from './transaction';

export default function initResolvers(web3: Web3, config: Options): IResolvers {
  return _.merge([accountResolvers, blockResolvers, txResolvers, scalarResolvers].map(f => f(web3, config)));
}
