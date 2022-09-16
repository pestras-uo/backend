import { Router } from 'express';
import controller from './controller.';
import middlewares from './middlewares';
import usersMiddleWares from '../../middlewares/users';
import auth from '../../middlewares/auth';
import { TokenType } from '../../auth/token';
import orgMiddleWares from '../../middlewares/orgunits';
import AdminValidators from './validators';

export default Router()
  .post(
    "/create",
    middlewares.validate(AdminValidators.CREATE_USER),
    auth(TokenType.API, ["users.create"]),
    usersMiddleWares.usernameExists("body.username"),
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
    '/change-orgunit/:id',
    middlewares.validate(AdminValidators.CHANGE_USER_ORG),
    auth(TokenType.API, ["users.update.orgunit"]),
    usersMiddleWares.exists("params.id"),
    orgMiddleWares.exists("body.organization"),
    controller.updateOrgunit
  )
  .put(
    '/activate/:id/:state',
    auth(TokenType.API, ["users.update.active"], "id"),
    usersMiddleWares.exists("params.id"),
    controller.activateUser
  )