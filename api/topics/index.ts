import { Router } from "express";
import auth from "../../middlewares/auth";
import controller from "./controller";
import validate from "../../middlewares/validate";
import { TopicsValidators } from "./validators";
import { docUpload } from "../../middlewares/upload";

export default Router()
  .get(
    '/',
    auth("topics.get.all"),
    controller.getAll
  )
  .get(
    '/:id',
    auth("topics.get.one"),
    controller.get
  )
  .get(
    '/:id/documents',
    auth("topics.get.documents"),
    controller.getDocuments
  )
  .post(
    '/',
    validate(TopicsValidators.CREATE),
    auth("topics.create.one"),
    controller.create
  )
  .post(
    '/:id/documents',
    validate(TopicsValidators.ADD_DOCUMENT),
    auth("topics.create.documents"),
    docUpload.single('document'),
    controller.addDocument
  )
  .put(
    '/:id',
    validate(TopicsValidators.UPDATE),
    auth("topics.update.one"),
    controller.update
  )
  .put(
    '/:id/categories',
    validate(TopicsValidators.UPDATE_CATEGORIES),
    auth("topics.update.categories"),
    controller.updateCategories
  )
  .delete(
    '/:id/documents',
    validate(TopicsValidators.DELETE_DOCUMENT),
    auth("topics.delete.documents"),
    controller.removeDocument
  )