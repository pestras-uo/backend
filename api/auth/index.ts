import { Router } from 'express';
import { TokenType } from '../../auth/token';
import auth from '../../middlewares/auth';
import AuthController from './controller';
import middleWares from './middlewares';
import usersMiddleWares from '../../middlewares/users'
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
  );