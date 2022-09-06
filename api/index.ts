import { Router } from 'express';

import authApi from './auth';
import adminApi from './admin';
import usersApi from './users';
import documents from './documents';
import organizations from './organizations';

export default Router()
  .use('/auth', authApi)
  .use('/admin', adminApi)
  .use('/users', usersApi)
  .use('/documents', documents)
  .use('/orgs', organizations);
