import { Router } from 'express';
import auth from '../../middlewares/auth';
import controller from './controller';
import middlewares from './middlewares';
import usersMiddlewares from '../../middlewares/users';
import orgMiddlewares from '../../middlewares/organziations';
import { TokenType } from '../../auth/token';
import UserValidators from './validators';

export default Router()
  .get(
    '/', 
    auth(TokenType.API, ["users.get.many"]), 
    controller.getMany
  )
  .get(
    '/inactive',
    auth(TokenType.API, ["users.get.inactive"]),
    controller.getInactive
  )
  .get(
    '/organziation/:id', 
    auth(TokenType.API, ["users.get.many"]),
    orgMiddlewares.exists("params.id"),
    controller.getByOrganziation
  )
  .get(
    '/:id',
    auth(TokenType.API, ["users.get.one"]),
    controller.get
  )
  .put(
    '/change-username',
    middlewares.validate(UserValidators.CHANGE_USERNAME),
    auth(),
    usersMiddlewares.usernameExists("body.username"),
    controller.changeUsername
  )
  .put(
    '/change-email', 
    middlewares.validate(UserValidators.CHNAGE_EMAIL), 
    auth(), 
    usersMiddlewares.emailExists("body.email"),
    controller.changeEmail
  )
  .put(
    '/change-password',
    middlewares.validate(UserValidators.CHANGE_PASSWORD),
    auth(),
    controller.changePassword
  )
  .put(
    '/profile',
    middlewares.validate(UserValidators.UPDATE_PROFILE),
    auth(),
    controller.updateProfile
  );