import controller from "./controller";
import { Router } from "express";
import auth from "middlewares/auth";
import validate from "middlewares/validate";
import { EquationsValidators } from "./validators";

export default Router()
  .get(
    '/',
    auth(["indicator.config.equation.get.one"]),
    controller.get
  )
  .get(
    '/arguments',
    auth(["indicator.config.equation.get.arguments"]),
    controller.getArguments
  )
  .post(
    '/',
    validate(EquationsValidators.CREATE),
    auth(["indicator.config.equation.create.one"]),
    controller.create
  )
  .put(
    '/',
    validate(EquationsValidators.UPDATE),
    auth(["indicator.config.equation.update.one"]),
    controller.update
  )