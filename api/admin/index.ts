import { Router } from 'express';
import controller from './controller';
import validate from '../../middlewares/validate';
import auth from '../../middlewares/auth';
import schemas from './validators';
import exists from '../../middlewares/exists';
import { TablesNames } from '../../models';

export default Router()
  .post(
    "/create",
    validate(schemas.CREATE_USER),
    auth("users.create.one"),
    controller.createUser
  )
  .put(
    '/:id/roles',
    validate(schemas.UPDATE_USER_ROLES),
    auth("users.update.roles"),
    controller.updateRoles
  )
  .put(
    '/:id/groups',
    validate(schemas.UPDATE_USER_GROUPS),
    auth("users.update.groups"),
    controller.updateGroups
  )
  .put(
    '/:id/orgunit',
    validate(schemas.CHANGE_USER_ORG),
    auth("users.update.orgunit"),
    exists(TablesNames.ORGUNITS, "body.orgunit"),
    controller.updateOrgunit
  )
  .put(
    '/:id/activate/:state',
    auth("users.update.active"),
    controller.activateUser
  );