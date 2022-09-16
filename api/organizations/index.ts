import { Router } from 'express';
import { TokenType } from '../../auth/token';
import auth from '../../middlewares/auth';
import controller from './controller';
import middlewares from './middlewares';
import OrgValidators from './validators';
import orgsMiddlewares from '../../middlewares/orgunits';

export default Router()
  .get(
    '/',
    auth(TokenType.API, ['orgs.get.many']),
    controller.getMany
  )
  .get(
    '/:id',
    auth(TokenType.API, ['orgs.get.one']),
    controller.getById
  )
  .post(
    '/',
    middlewares.validate(OrgValidators.CREATE),
    auth(TokenType.API, ['orgs.create']),
    controller.create
  )
  .put(
    '/name/:id',
    middlewares.validate(OrgValidators.UPDATE_NAME),
    auth(TokenType.API, ['orgs.update.name']),
    orgsMiddlewares.exists("params.id"),
    controller.updateName
  )
  .put(
    '/tags/:id',
    middlewares.validate(OrgValidators.UPDATE_TAGS),
    auth(TokenType.API, ['orgs.update.tags']),
    orgsMiddlewares.exists("params.id"),
    controller.updateTags
  );