import { NextFunction, Request, Response } from 'express';
import { HttpError } from '../misc/errors';
import { HttpCode } from '../misc/http-codes';
import topicsModel from '../models/core/topics';
import getValue from '../util/valueFromPath';

export default {
  exists(path: string) {

    return async (req: Request, _: Response, next: NextFunction) => {
      const id = getValue(req, path);

      if (!id)
        return next(new HttpError(HttpCode.BAD_REQUEST, "invalidIdParam"));

      try {
        if (!(await topicsModel.exists(id)))
          return next(new HttpError(HttpCode.NOT_FOUND, "topicNotFound"));

      } catch (error) {
        return next(error);
      }

      next();
    }
  }
}