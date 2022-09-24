import { Router } from "express";
import { TokenType } from "../../auth/token";
import auth from "../../middlewares/auth";
import validate from "../../middlewares/validate";
import controller from "./controller";
import { CategoriesValidators } from "./validators";
import categoriesMiddleWares from '../../middlewares/categories';

export default Router()
  .get(
    '/',
    auth(TokenType.SESSION, ["categories.get.all"]),
    controller.getAll
  )
  .post(
    '/',
    validate(CategoriesValidators.CREATE),
    auth(TokenType.SESSION, ["categories.create"]),
    controller.create
  )
  .put(
    '/:id',
    validate(CategoriesValidators.UPDATE),
    auth(TokenType.SESSION, ["categories.update"]),
    categoriesMiddleWares.exists('params.id'),
    controller.update
  );