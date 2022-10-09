import { Router } from "express";
import auth from "../../middlewares/auth";
import validate from "../../middlewares/validate";
import controller from "./controller";
import { GroupsValidators } from "./validators";

export default Router()
  .get(
    '/',
    auth('groups.get.all'),
    controller.getAll
  )
  .get(
    '/:id',
    auth("groups.get.one"),
    controller.get
  )
  .post(
    '/',
    validate(GroupsValidators.CREATE),
    auth('groups.create.one'),
    controller.create
  )
  .put(
    '/:id',
    validate(GroupsValidators.UPDATE),
    auth('groups.update.one'),
    controller.update
  )
  .put(
    '/:id/actions',
    validate(GroupsValidators.UPDATE_ROLES),
    auth('groups.update.actions'),
    controller.updateRoles
  )
  .put(
    '/:id/orgunits',
    validate(GroupsValidators.UPDATE_ORGUNIT),
    auth('groups.update.orgunit'),
    controller.updateOrgunit
  )