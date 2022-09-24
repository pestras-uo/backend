import { Router } from "express";
import { TokenType } from "../../auth/token";
import auth from "../../middlewares/auth";
import controller from "./controller";
import topicsMiddleWares from '../../middlewares/topics';
import validate from "../../middlewares/validate";
import { TopicsValidators } from "./validators";

export default Router()
  .get(
    '/',
    auth(TokenType.SESSION, ["topics.get.all"]),
    controller.getAll
  )
  .get(
    '/:id',
    auth(TokenType.SESSION, ["topics.get.one"]),
    topicsMiddleWares.exists("req.params"),
    controller.get
  )
  .get(
    '/:id/tags',
    auth(TokenType.SESSION, ["topics.get.tags"]),
    topicsMiddleWares.exists("req.params"),
    controller.getTags
  )
  .post(
    '/',
    validate(TopicsValidators.CREATE),
    auth(TokenType.SESSION, ["topics.create"]),
    controller.create
  )
  .put(
    '/:id',
    validate(TopicsValidators.UPDATE),
    auth(TokenType.SESSION, ["topics.update"]),
    topicsMiddleWares.exists("req.params"),
    controller.update
  )
  .put(
    '/:id/groups',
    validate(TopicsValidators.UPDATE_GROUPS),
    auth(TokenType.SESSION, ["topics.update.groups"]),
    topicsMiddleWares.exists("req.params"),
    controller.updateGroups
  )
  .put(
    '/:id/categories',
    validate(TopicsValidators.UPDATE_CATEGORIES),
    auth(TokenType.SESSION, ["topics.update.categories"]),
    topicsMiddleWares.exists("req.params"),
    controller.updateCategories
  )
  .put(
    '/:id/documents',
    validate(TopicsValidators.ADD_DOCUMENT),
    auth(TokenType.SESSION, ["topics.update.documents"]),
    topicsMiddleWares.exists("req.params"),
    controller.addDocument
  )
  .delete(
    '/:id/documents/:doc_id',
    validate(TopicsValidators.ADD_DOCUMENT),
    auth(TokenType.SESSION, ["topics.update.documents"]),
    controller.removeDocument
  )