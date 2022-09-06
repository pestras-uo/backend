import { NextFunction, Request, Response } from "express";
import { ObjectId } from "mongodb";
import { HttpError } from "../misc/errors";
import { HttpCode } from "../misc/http-codes";
import organziationModel from '../models/organization';
import getValue from '../util/valueFromPath';

export default {
  exists(path: string) {

    return async (req: Request, res: Response, next: NextFunction) => {
      let id: ObjectId;

      try {
        id = new ObjectId(getValue(req, path));
      } catch (error) {
        return next(new HttpError(HttpCode.BAD_REQUEST, "invalidUserId"));
      }

      if (await organziationModel.exists(id))
        return next(new HttpError(HttpCode.CONFLICT, "emailAlreadyExists"));

      next();
    }
  }
}