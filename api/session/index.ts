import { Router } from 'express';
import auth from '../../middlewares/auth';
import controller from './controller';
import middleWares from './middlewares';
import validators from './validators';

export default Router()
  .get(
    '/verify-session',
    auth(), 
    controller.verifySession
  )
  .post(
    '/login',
    middleWares.validate(validators.LOGIN),
    controller.login
  )
  .post(
    '/logout',
    auth(),
    controller.logout
  );