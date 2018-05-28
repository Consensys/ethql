import { IResolvers } from 'graphql-tools';
import * as _ from 'lodash';
import accountResolvers from './account';
import blockResolvers from './block';
import scalarResolvers from './scalars';
import txResolvers from './transaction';

export default _.merge([accountResolvers, blockResolvers, txResolvers, scalarResolvers]) as IResolvers;
