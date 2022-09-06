import { NextFunction, Request, Response } from "express";
import { HttpCode } from "../misc/http-codes";
import { TokenType, verifyToken } from '../auth/token';
import { Action } from "../auth/roles/actions";
import RolesManager from "../auth/roles/manager";
import { HttpError } from "../misc/errors";
import { ObjectId } from "mongodb";
import userModel from '../models/user';

export default function (tokenType = TokenType.API, actions: Action[] = [], affectedIdParam?: string) {
  return async (req: Request, res: Response, next: NextFunction) => {

    let token: string;

    if (tokenType === TokenType.API) {
      let authHeader = req.header("Authorization");

      if (!authHeader)
        return next(new HttpError(HttpCode.TOKEN_REQUIRED, "unauthorized"));

      token = authHeader.split(" ")[1];

    } else {
      token = req.query.t as string;
    }

    const { user, tokenData } = await verifyToken(token, tokenType);

    if (actions?.length > 0) {

      if (affectedIdParam) {
        const affectedUser = await getAffectedUser(req, affectedIdParam);

        if (!RolesManager.authorize(user, actions, affectedUser))
          return next(new HttpError(HttpCode.UNAUTHORIZED, "unauthrizedRole"));

      } else {

        if (!RolesManager.authorize(user, actions))
          return next(new HttpError(HttpCode.UNAUTHORIZED, "unauthrizedRole"));
      }
    }

    res.locals.user = user;
    res.locals.token = token;
    res.locals.tokenData = tokenData;

    next();
  }
}

async function getAffectedUser(req: Request, param: string) {
  let id: ObjectId;

  if (!req.params[param])
    throw new HttpError(HttpCode.BAD_REQUEST, 'affectedUserIdParamNotFound');

  try {
    id = new ObjectId(req.params[param]);
  } catch (error) {
    throw new HttpError(HttpCode.BAD_REQUEST, 'invalidAffectedUserId');
  }

  const user = await userModel.get(id);

  if (!user)
    throw new HttpError(HttpCode.NOT_FOUND, 'affectedUserNotFound');

  return user;
}