import { NextFunction, Request, Response } from "express";
import getValue from '../util/valueFromPath';
import groupsModel from '../models/auth/groups';
import { HttpError } from "../misc/errors";
import { HttpCode } from "../misc/http-codes";

export default {
  exists(path: string) {

    return async (req: Request, _: Response, next: NextFunction) => {
      const id = getValue(req, path);

      if (!id)
        return next(new HttpError(HttpCode.BAD_REQUEST, "invalidIdParam"));

      try {
        if (!(await groupsModel.exists(id)))
          return next(new HttpError(HttpCode.NOT_FOUND, "groupNotFound"));

      } catch (error) {
        return next(error);
      }

      next();
    }
  }
}