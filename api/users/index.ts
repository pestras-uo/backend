import { Router } from 'express';
import auth from '../../middlewares/auth';
import controller from './controller';
import middlewares from './middlewares';
import usersMiddlewares from '../../middlewares/users';
import orgMiddlewares from '../../middlewares/orgunits';
import { TokenType } from '../../auth/token';
import UserValidators from './validators';
import { avatarUpload } from '../../middlewares/upload';

export default Router()
  .get(
    '/', 
    auth(TokenType.SESSION, ["users.get.all"]), 
    controller.getAll
  )
  .get(
    '/inactive',
    auth(TokenType.SESSION, ["users.get.inactive"]),
    controller.getInactive
  )
  .get(
    '/organziation/:id', 
    auth(TokenType.SESSION, ["users.get.by-orgunit"]),
    orgMiddlewares.exists("params.id"),
    controller.getByOrgunit
  )
  .get(
    '/:id',
    auth(TokenType.SESSION, ["users.get.one"]),
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
    '/change-password',
    middlewares.validate(UserValidators.CHANGE_PASSWORD),
    auth(),
    controller.changePassword
  )
  .put(
    '/profile',
    middlewares.validate(UserValidators.UPDATE_PROFILE),
    auth(),
    avatarUpload.single('avatar'),
    controller.updateProfile
  )
  .put(
    '/avatar',
    auth(),
    avatarUpload.single('avatar'),
    controller.updateAvatar
  )
