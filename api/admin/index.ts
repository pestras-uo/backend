import { Router } from 'express';
import controller from './controller';
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
    controller.createUser
  )
  .put(
    '/:id/roles',
    validate(schemas.UPDATE_USER_ROLES),
    auth(TokenType.SESSION, ["users.update.roles"], "id"),
    usersMiddleWares.exists("params.id"),
    controller.updateRoles
  )
  .put(
    '/:id/groups',
    validate(schemas.UPDATE_USER_GROUPS),
    auth(TokenType.SESSION, ["users.update.groups"], "id"),
    usersMiddleWares.exists("params.id"),
    controller.updateGroups
  )
  .put(
    '/:id/orgunit',
    validate(schemas.CHANGE_USER_ORG),
    auth(TokenType.SESSION, ["users.update.orgunit"]),
    usersMiddleWares.exists("params.id"),
    orgMiddleWares.exists("body.orgunit"),
    controller.updateOrgunit
  )
  .put(
    '/:id/activate/:state',
    auth(TokenType.SESSION, ["users.update.active"], "id"),
    usersMiddleWares.exists("params.id"),
    controller.activateUser
  )