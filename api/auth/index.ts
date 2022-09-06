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
  .get(
    '/activate-email',
    auth(TokenType.EMAIL),
    AuthController.activateEmail
  )
  .post(
    '/login',
    middleWares.validate(AuthValidators.LOGIN),
    AuthController.login
  )
  .post(
    '/signup',
    middleWares.validate(AuthValidators.SIGNUP),
    usersMiddleWares.usernameOrEmailExists("body.username", "body.email"),
    AuthController.signup
  )
  .post(
    'forgot-password',
    AuthController.resendActiviationEmail
  )
  .post(
    'forgot-password',
    middleWares.validate(AuthValidators.RESEND_ACTIVATION_EMAIL),
    AuthController.forgotPassword
  )
  .put(
    '/reset-password',
    middleWares.validate(AuthValidators.RESET_PASSWORD),
    auth(TokenType.PASSWORD),
    AuthController.resetPassword
  );