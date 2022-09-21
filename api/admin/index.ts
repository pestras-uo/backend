import { Router } from 'express';
import controller from './controller.';
import validate from '../../middlewares/validate';
import usersMiddleWares from '../../middlewares/users';
import auth from '../../middlewares/auth';
import { TokenType } from '../../auth/token';
import orgMiddleWares from '../../middlewares/orgunits';
import schemas from './validators';

export default Router()
  .post(
    "/create",
    validate(schemas.CREATE_USER),
    auth(TokenType.SESSION, ["users.create"]),
    usersMiddleWares.usernameExists("body.username"),
    controller.createUser
  )
  .put(
    '/update-roles/:id',
    validate(schemas.UPDATE_USER_ROLES),
    auth(TokenType.SESSION, ["users.update.roles"], "id"),
    usersMiddleWares.exists("params.id"),
    controller.updateRoles
  )
  .put(
    '/update-groups/:id',
    validate(schemas.UPDATE_USER_GROUPS),
    auth(TokenType.SESSION, ["users.update.groups"], "id"),
    usersMiddleWares.exists("params.id"),
    controller.updateGroups
  )
  .put(
    '/update-orgunit/:id',
    validate(schemas.CHANGE_USER_ORG),
    auth(TokenType.SESSION, ["users.update.orgunit"]),
    usersMiddleWares.exists("params.id"),
    orgMiddleWares.exists("body.orgunit"),
    controller.updateOrgunit
  )
  .put(
    '/activate/:id/:state',
    auth(TokenType.SESSION, ["users.update.active"], "id"),
    usersMiddleWares.exists("params.id"),
    controller.activateUser
  )