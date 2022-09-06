import { Router } from 'express';
import controller from './controller.';
import middlewares from './middlewares';
import usersMiddleWares from '../../middlewares/users';
import auth from '../../middlewares/auth';
import { TokenType } from '../../auth/token';
import orgMiddleWares from '../../middlewares/organziations';
import AdminValidators from './validators';

export default Router()
  .post(
    "/create",
    middlewares.validate(AdminValidators.CREATE_USER),
    auth(TokenType.API, ["users.create"]),
    usersMiddleWares.usernameOrEmailExists("body.username", "body.email"),
    controller.createUser
  )
  .put(
    '/update-roles/:id',
    middlewares.validate(AdminValidators.UPDATE_USER_ROLES),
    auth(TokenType.API, ["users.update.roles"], "id"),
    usersMiddleWares.exists("params.id"),
    controller.updateRoles
  )
  .put(
    '/change-organziation/:id',
    middlewares.validate(AdminValidators.CHANGE_USER_ORG),
    auth(TokenType.API, ["user.update.organziation"]),
    usersMiddleWares.exists("params.id"),
    orgMiddleWares.exists("body.organization"),
    controller.updateOrganization
  )
  .put(
    '/activate/:id',
    auth(TokenType.API, ["users.update.active"], "id"),
    usersMiddleWares.exists("params.id"),
    controller.activateUser
  )
  .put(
    '/deactivate/:id',
    auth(TokenType.API, ["users.update.active"], "id"),
    usersMiddleWares.exists("params.id"),
    controller.activateUser
  );