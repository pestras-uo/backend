import { NextFunction, Request, Response } from "express";
import { HttpError } from "../misc/errors";
import { HttpCode } from "../misc/http-codes";
import getValue from '../util/valueFromPath';
import tagsModel from '../models/misc/tags'

export default {
  keyExists(path: string) {
    return async (req: Request, _: Response, next: NextFunction) => {
      const id = getValue(req, path);

      if (!id)
        return next(new HttpError(HttpCode.BAD_REQUEST, "invalidIdParam"));

      try {
        if (!(await tagsModel.keyExists(id)))
          return next(new HttpError(HttpCode.NOT_FOUND, "tagKeyNotFound"));

      } catch (error) {
        return next(error);
      }

      next();
    }
  },

  valueExists(path: string) {
    return async (req: Request, _: Response, next: NextFunction) => {
      const id = getValue(req, path);

      if (!id)
        return next(new HttpError(HttpCode.BAD_REQUEST, "invalidIdParam"));

      try {
        if (!(await tagsModel.valueExists(id)))
          return next(new HttpError(HttpCode.NOT_FOUND, "tagValueNotFound"));

      } catch (error) {
        return next(error);
      }

      next();
    }
  }
}