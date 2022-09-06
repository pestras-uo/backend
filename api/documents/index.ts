import { Router } from 'express';
import controller from './controller';
import middlewares from './middlewares';
import upload from '../../middlewares/upload';
import auth from '../../middlewares/auth';
import { TokenType } from '../../auth/token';
import DocumentValidators from './validators';

export default Router()
  .post(
    '/',
    middlewares.validate(DocumentValidators.CREATE),
    auth(TokenType.API, ["documents.create"]),
    upload.single('file'),
    controller.create
  )

  .delete(
    '/:id',
    auth(TokenType.API, ["documents.delete"]),
    controller.delete
  );