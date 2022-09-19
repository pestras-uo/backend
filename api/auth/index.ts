import { Router } from 'express';
import auth from '../../middlewares/auth';
import AuthController from './controller';
import middleWares from './middlewares';
import AuthValidators from './validators';

export default Router()
  .get(
    '/verifySession',
    auth(), 
    AuthController.verifySession
  )
  .post(
    '/login',
    middleWares.validate(AuthValidators.LOGIN),
    AuthController.login
  )
  .get(
    '/logout',
    auth(),
    AuthController.logout
  );