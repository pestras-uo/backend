import { Router } from 'express';
import auth from '../../middlewares/auth';
import controller from './controller';
import validate from '../../middlewares/validate';
import { TokenType } from '../../auth/token';
import { UserValidators } from './validators';
import { avatarUpload } from '../../middlewares/upload';

export default Router()
  .get(
    '/', 
    auth("users.get.all"),
    controller.getAll
  )
  .get(
    '/inactive',
    auth("users.get.inactive"),
    controller.getInactive
  )
  .get(
    '/orgunit/:orgunit_id', 
    auth("users.get.by-orgunit"),
    controller.getByOrgunit
  )
  .get(
    '/:id',
    auth("users.get.one"),
    controller.get
  )
  .put(
    '/username',
    validate(UserValidators.CHANGE_USERNAME),
    auth(),
    controller.updateUsername
  )
  .put(
    '/password',
    validate(UserValidators.CHANGE_PASSWORD),
    auth(),
    controller.updatePassword
  )
  .put(
    '/profile',
    validate(UserValidators.UPDATE_PROFILE),
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
