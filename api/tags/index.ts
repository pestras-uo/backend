import { Router } from "express";
import { TokenType } from "../../auth/token";
import auth from "../../middlewares/auth";
import validate from "../../middlewares/validate";
import controller from "./controller";
import { TagsValidators } from "./validators";
import tagsMiddleWares from '../../middlewares/tags';

export default Router()
  .get(
    '/keys',
    auth(TokenType.SESSION, ['tags.get.keys']),
    controller.getKeys
  )
  .get(
    '/',
    auth(TokenType.SESSION, ['tags.get.values']),
    controller.getValues
  )
  .post(
    '/',
    validate(TagsValidators.CREATE_KEY),
    auth(TokenType.SESSION, ['tags.create.key']),
    controller.createKey
  )
  .post(
    '/:id',
    validate(TagsValidators.CREATE_VALUE),
    auth(TokenType.SESSION, ['tags.create.value']),
    tagsMiddleWares.keyExists('params.id'),
    controller.createValue
  )
  .put(
    '/:id',
    validate(TagsValidators.UPDATE_KEY),
    auth(TokenType.SESSION, ['tags.update.key']),
    tagsMiddleWares.keyExists('params.id'),
    controller.updateKey
  )
  .put(
    '/:key_id/:id',
    validate(TagsValidators.UPDATE_KEY),
    auth(TokenType.SESSION, ['tags.update.value']),
    tagsMiddleWares.keyExists('params.key_id'),
    tagsMiddleWares.valueExists('params.id'),
    controller.updateValue
  )