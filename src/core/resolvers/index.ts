import * as _ from 'lodash';

import account from './account';
import block from './block';
import health from './health';
import log from './log';
import root from './root';
import scalars from './scalars';
import storage from './storage';
import transaction from './transaction';

export default [root, block, transaction, account, log, storage, scalars, health].reduce(
  (prev, curr) => _.merge(curr, prev),
  {},
);
