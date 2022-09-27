import { Router } from 'express';

import sessionApi from './session';
import adminApi from './admin';
import usersApi from './users';
import groupsApi from './groups';
import orgunits from './orgunits';
import topics from './topics';
import categories from './categories';
import tags from './tags';
import indicators from './indicators';
import indicatorConfig from './indicator-config';

export default Router()
  .use('/session', sessionApi)
  .use('/admin', adminApi)
  .use('/users', usersApi)
  .use('/groups', groupsApi)
  .use('/orgunits', orgunits)
  .use('/categories', categories)
  .use('/tags', tags)
  .use('/topics', topics)
  .use('/indicators', indicators)
  .use('/indicators-config', indicatorConfig);
