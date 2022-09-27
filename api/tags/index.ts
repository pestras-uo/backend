import { Router } from "express";
import auth from "../../middlewares/auth";
import validate from "../../middlewares/validate";
import controller from "./controller";
import { TagsValidators } from "./validators";

export default Router()
  .get(
    '/',
    auth(['tags.get.all']),
    controller.getall
  )
  .get(
    '/keys',
    auth(['tags.get.keys']),
    controller.getKeys
  )
  .get(
    '/values',
    auth(['tags.get.values']),
    controller.getValues
  )
  .post(
    '/keys',
    validate(TagsValidators.CREATE_KEY),
    auth(['tags.create.key']),
    controller.createKey
  )
  .post(
    '/values/:key_id',
    validate(TagsValidators.CREATE_VALUE),
    auth(['tags.create.value']),
    controller.createValue
  )
  .put(
    '/keys/:id',
    validate(TagsValidators.UPDATE_KEY),
    auth(['tags.update.key']),
    controller.updateKey
  )
  .put(
    '/values/:key_id/:id',
    validate(TagsValidators.UPDATE_KEY),
    auth(['tags.update.value']),
    controller.updateValue
  )