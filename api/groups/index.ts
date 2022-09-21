import { Router } from "express";
import { TokenType } from "../../auth/token";
import auth from "../../middlewares/auth";
import validate from "../../middlewares/validate";
import controller from "./controller";
import { GroupsValidators } from "./validators";

export default Router()
  .get(
    '/',
    auth(TokenType.SESSION, ['groups.get.all']),
    controller.getAll
  )
  .get(
    '/:id',
    auth(TokenType.SESSION, ["groups.get.one"]),
    controller.get
  )
  .post(
    '/',
    validate(GroupsValidators.CREATE),
    auth(TokenType.SESSION, ['groups.create']),
    controller.create
  )
  .put(
    '/:id',
    validate(GroupsValidators.UPDATE),
    auth(TokenType.SESSION, ['groups.update']),
    controller.update
  )