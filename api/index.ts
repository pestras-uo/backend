import { Router } from 'express';

import sessionApi from './session';
import adminApi from './admin';
import usersApi from './users';
import groupsApi from './groups';
import orgunits from './orgunits';
import topics from './topics';
import categories from './categories';
import indicators from './indicators';

export default Router()
  .use('/session', sessionApi)
  .use('/admin', adminApi)
  .use('/users', usersApi)
  .use('/groups', groupsApi)
  .use('/orgunits', orgunits)
  .use('/categories', categories)
  .use('/topics', topics)
  .use('/indicators', indicators)
