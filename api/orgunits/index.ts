import { Router } from 'express';
import { TokenType } from '../../auth/token';
import auth from '../../middlewares/auth';
import controller from './controller';
import middlewares from './middlewares';
import orgunitsValidators from './validators';
import orgunitsMiddlewares from '../../middlewares/orgunits';

export default Router()
  .get(
    '/',
    auth(TokenType.API, ['orgunits.get.many']),
    controller.getMany
  )
  .get(
    '/:id',
    auth(TokenType.API, ['orgunits.get.one']),
    controller.getById
  )
  .post(
    '/',
    middlewares.validate(orgunitsValidators.CREATE),
    auth(TokenType.API, ['orgunits.create']),
    controller.create
  )
  .put(
    '/name/:id',
    middlewares.validate(orgunitsValidators.UPDATE_NAME),
    auth(TokenType.API, ['orgunits.update.name']),
    orgunitsMiddlewares.exists("params.id"),
    controller.updateName
  );