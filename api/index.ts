import { Router } from 'express';

import authApi from './auth';
import adminApi from './admin';
import usersApi from './users';
import orgunits from './orgunits';

export default Router()
  .use('/auth', authApi)
  .use('/admin', adminApi)
  .use('/users', usersApi)
  .use('/orgunits', orgunits);
