import { NextFunction, Request, Response } from "express";
import { HttpError } from "../misc/errors";
import { HttpCode } from "../misc/http-codes";
import { exists, TablesNames } from "../models";
import getValue from '../util/valueFromPath';

export default function (tableName: TablesNames, path: string) {

  return async (req: Request, _: Response, next: NextFunction) => {
    const id = getValue(req, path);

    if (!id)
      return next(new HttpError(HttpCode.BAD_REQUEST, "invalidIdParam"));

    try {
      if (!(await exists(tableName, id)))
        return next(new HttpError(HttpCode.NOT_FOUND, `${tableName}EntityNotFound`));

    } catch (error) {
      return next(error);
    }

    next();
  }
}