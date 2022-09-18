import { NextFunction, Request, Response } from "express";
import { HttpError } from "../misc/errors";
import { HttpCode } from "../misc/http-codes";
import getValue from '../util/valueFromPath';
import usersModel from '../models/auth/user';

export default {
  exists(path: string) {
    return async (req: Request, res: Response, next: NextFunction) => {
      const id = getValue(req, path);

      if (!id)
        return next(new HttpError(HttpCode.BAD_REQUEST, "invalidIdParam"));

      if (!(await usersModel.exists(id)))
        return next(new HttpError(HttpCode.NOT_FOUND, "userNotFound"));

      next();
    }
  },

  usernameExists(path: string) {
    return async (req: Request, res: Response, next: NextFunction) => {
      const username = getValue(req, path);

      if (!username)
        return next(new HttpError(HttpCode.BAD_REQUEST, "usernameNotFound"));

      if (await usersModel.usernameExists(username))
        return next(new HttpError(HttpCode.CONFLICT, "usernameAlreadyExists"));

      next();
    }
  },
}