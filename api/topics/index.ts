import { Router } from "express";
import auth from "../../middlewares/auth";
import controller from "./controller";
import validate from "../../middlewares/validate";
import { TopicsValidators } from "./validators";

export default Router()
  .get(
    '/',
    auth(["topics.get.all"]),
    controller.getAll
  )
  .get(
    '/:id',
    auth(["topics.get.one"]),
    controller.get
  )
  .get(
    '/:id/tags',
    auth(["topics.get.tags"]),
    controller.getTags
  )
  .post(
    '/',
    validate(TopicsValidators.CREATE),
    auth(["topics.create"]),
    controller.create
  )
  .put(
    '/:id',
    validate(TopicsValidators.UPDATE),
    auth(["topics.update"]),
    controller.update
  )
  .put(
    '/:id/groups',
    validate(TopicsValidators.UPDATE_GROUPS),
    auth(["topics.update.groups"]),
    controller.updateGroups
  )
  .put(
    '/:id/categories',
    validate(TopicsValidators.UPDATE_CATEGORIES),
    auth(["topics.update.categories"]),
    controller.updateCategories
  )
  .put(
    '/:id/documents',
    validate(TopicsValidators.ADD_DOCUMENT),
    auth(["topics.update.documents"]),
    controller.addDocument
  )
  .delete(
    '/:id/documents/:doc_id',
    auth(["topics.update.documents"]),
    controller.removeDocument
  )