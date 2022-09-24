import { NextFunction, Request, Response } from "express";
import getValue from '../util/valueFromPath';
import categoriesModel from '../models/misc/categories';
import { HttpError } from "../misc/errors";
import { HttpCode } from "../misc/http-codes";

export default {
  exists(path: string) {

    return async (req: Request, _: Response, next: NextFunction) => {
      const id = getValue(req, path);

      if (!id)
        return next(new HttpError(HttpCode.BAD_REQUEST, "invalidIdParam"));

      try {
        if (!(await categoriesModel.exists(id)))
          return next(new HttpError(HttpCode.NOT_FOUND, "categoryNotFound"));

      } catch (error) {
        return next(error);
      }

      next();
    }
  }
}