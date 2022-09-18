import { NextFunction, Request, Response } from "express";
import { HttpError } from "../misc/errors";
import { HttpCode } from "../misc/http-codes";
import organziationModel from '../models/core/orgunits';
import getValue from '../util/valueFromPath';

export default {
  exists(path: string) {

    return async (req: Request, res: Response, next: NextFunction) => {
      const id = getValue(req, path);

      if (!id)
        return next(new HttpError(HttpCode.BAD_REQUEST, "invalidIdParam"));

      if (!(await organziationModel.exists(id)))
        return next(new HttpError(HttpCode.NOT_FOUND, "organziationNotFound"));

      next();
    }
  }
}