import { Router } from 'express';
import auth from '../../middlewares/auth';
import controller from './controller';
import validate from '../../middlewares/validate';
import orgunitsValidators from './validators';

export default Router()
  .get(
    '/',
    auth(['orgunits.get.many']),
    controller.getAll
  )
  .get(
    '/:id',
    auth(['orgunits.get.one']),
    controller.getById
  )
  .post(
    '/',
    validate(orgunitsValidators.CREATE),
    auth(['orgunits.create']),
    controller.create
  )
  .put(
    '/:id',
    validate(orgunitsValidators.UPDATE_NAME),
    auth(['orgunits.update.name']),
    controller.update
  );