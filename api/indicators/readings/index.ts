import { Router } from "express";
import auth from "../../../middlewares/auth";
import { docUpload } from "../../../middlewares/upload";
import validate from "../../../middlewares/validate";
import controller from "./controller";
import { ReadingsValidators } from "./validators";

export default Router()
  .get(
    '/',
    validate(ReadingsValidators.GET_ALL, 'query'),
    auth(['indicators.readings.get.all']),
    controller.getByPage
  )
  .get(
    '/:reading_id',
    auth(["indicators.readings.get.one"]),
    controller.getById
  )
  .get(
    '/:reading_id/documents',
    auth(["indicators.readings.get.documents"]),
    controller.getDocuments
  )
  .post(
    '/',
    validate(ReadingsValidators.CREATE),
    auth(["indicators.readings.create.one"]),
    controller.create
  )
  .post(
    '/:reading_id/documents',
    auth(["indicators.readings.create.documents"]),
    docUpload.single('document'),
    controller.addDocument
  )
  .put(
    '/:reading_id',
    validate(ReadingsValidators.UPDATE),
    auth(["indicators.readings.update.one"]),
    controller.update
  )
  .put(
    '/:reading_id/approve/:state',
    auth(['indicators.readings.update.approve']),
    controller.approve
  )
  .delete(
    '/:reading_id/documents',
    validate(ReadingsValidators.DELETE_DOCUMENT),
    auth(['indicators.readings.delete.documents']),
    controller.deleteDocument
  )