import { NextFunction, Request, Response } from "express";
import { HttpError } from "../misc/errors";
import { HttpCode } from "../misc/http-codes";
import getValue from '../util/valueFromPath';
import usersModel from '../models/user';
import { ObjectId } from "mongodb";

export default {
  exists(path: string) {
    return async (req: Request, res: Response, next: NextFunction) => {
      let id: ObjectId;

      try {
        id = new ObjectId(getValue(req, path));
      } catch (error) {
        return next(new HttpError(HttpCode.BAD_REQUEST, "invalidUserId"));
      }

      if (await usersModel.exists(id))
        return next(new HttpError(HttpCode.CONFLICT, "emailAlreadyExists"));

      next();
    }
  },

  emailExists(path: string) {
    return async (req: Request, res: Response, next: NextFunction) => {
      const email = getValue(req, path);

      if (!email)
        return next(new HttpError(HttpCode.BAD_REQUEST, "emailNotFound"));

      if (await usersModel.emailExists(email))
        return next(new HttpError(HttpCode.CONFLICT, "emailAlreadyExists"));

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

  usernameOrEmailExists(usernamePath: string, emailPath: string) {
    return async (req: Request, res: Response, next: NextFunction) => {
      const username = getValue(req, usernamePath);
      const email = getValue(req, emailPath);

      if (!username)
        return next(new HttpError(HttpCode.BAD_REQUEST, "usernameNotFound"));

      if (!email)
        return next(new HttpError(HttpCode.BAD_REQUEST, "emailNotFound"));

      const exists = await usersModel.usernameOremailExists(username, email)
      
      if (exists)
        return next(new HttpError(HttpCode.CONFLICT, exists === 1 ? "usernameAlreadyExists" : "emailAlreadyExists"));

      next();
    }
  }
}