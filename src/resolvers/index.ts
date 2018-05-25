import { IResolvers } from 'graphql-tools';
import * as _ from 'lodash';
import accountResolvers from './account';
import blockResolvers from './block';
import txResolvers from './transaction';

export default _.merge([accountResolvers, blockResolvers, txResolvers]) as IResolvers;
