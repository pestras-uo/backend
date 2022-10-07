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
    auth('groups.create'),
    controller.create
  )
  .put(
    '/:id',
    validate(GroupsValidators.UPDATE),
    auth('groups.update'),
    controller.update
  )