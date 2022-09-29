import { Router } from "express";
import auth from "../../middlewares/auth";
import validate from "../../middlewares/validate";
import controller from "./controller";
import { CategoriesValidators } from "./validators";

export default Router()
  .get(
    '/',
    auth(["categories.get.all"]),
    controller.getAll
  )
  .get(
    '/:id',
    auth(["categories.get.one"]),
    controller.getAll
  )
  .post(
    '/',
    validate(CategoriesValidators.CREATE),
    auth(["categories.create"]),
    controller.create
  )
  .put(
    '/:id',
    validate(CategoriesValidators.UPDATE),
    auth(["categories.update"]),
    controller.update
  );