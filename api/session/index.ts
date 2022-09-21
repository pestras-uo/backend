import { Router } from 'express';
import auth from '../../middlewares/auth';
import controller from './controller';
import validate from '../../middlewares/validate';
import validators from './validators';

export default Router()
  .get(
    '/verify-session',
    auth(), 
    controller.verifySession
  )
  .post(
    '/login',
    validate(validators.LOGIN),
    controller.login
  )
  .post(
    '/logout',
    auth(),
    controller.logout
  );