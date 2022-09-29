import { Router } from "express";
import auth from "../../middlewares/auth";
import { docUpload } from "../../middlewares/upload";
import validate from "../../middlewares/validate";
import controller from "./controller";
import { ReadingsValidators } from "./validators";

export default Router()
  .get(
    '/indicator/:ind_id',
    validate(ReadingsValidators.GET_ALL, 'query'),
    auth(['readings.get.all']),
    controller.getByPage
  )
  .get(
    '/:id/indicator/:ind_id',
    auth(["readings.get.one"]),
    controller.getById
  )
  .post(
    '/:ind_id',
    validate(ReadingsValidators.CREATE),
    auth(["readings.create.one"]),
    controller.create
  )
  .post(
    '/:id/indicator/:ind_id/documents',
    auth(["readings.create.documents"]),
    docUpload.single('document'),
    controller.addDocument
  )
  .put(
    '/:id/indicator/:ind_id',
    validate(ReadingsValidators.UPDATE),
    auth(["readings.update.one"]),
    controller.update
  )
  .put(
    '/:id/indicator/:ind_id/approve/:state',
    auth(['readings.update.approve']),
    controller.approve
  )
  .delete(
    '/:id/indicator/:ind_id',
    auth(["readings.delete.one"]),
    controller.delete
  )
  .delete(
    '/:id/documents',
    validate(ReadingsValidators.DELETE_DOCUMENT),
    auth(['readings.delete.documents']),
    controller.deleteDocument
  )