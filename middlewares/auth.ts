import { NextFunction, Request, Response } from "express";
import { HttpCode } from "../misc/http-codes";
import { TokenType } from '../auth/token';
import { verifyToken } from "../auth";
import { Action } from "../auth/roles/actions";
import RolesManager from "../auth/roles/manager";
import { HttpError } from "../misc/errors";
import userModel from '../models/auth/user';

export default function (actions: Action[] = [], tokenType = TokenType.SESSION) {

  return async (req: Request, _: Response, next: NextFunction) => {
    const affectedUserId = (req.baseUrl + req.path).startsWith('/api/admin') 
      ? req.params.id 
      : null;

    const token = req.header("Authorization")?.split(" ")[1];
    const data = await verifyToken(token, tokenType);

    if (!data)
      throw new HttpError(HttpCode.INVALID_TOKEN, "invalidToken");

    if (!data.user.is_active)
      throw new HttpError(HttpCode.UNAUTHORIZED, 'userIsInactive');

    if (actions?.length > 0) {

      if (affectedUserId) {
        const affectedUser = await getAffectedUser(affectedUserId); 

        if (!RolesManager.authorize(data.user, actions, affectedUser))
          throw new HttpError(HttpCode.UNAUTHORIZED, "unauthorizedRole");

      } else {
        if (!RolesManager.authorize(data.user, actions))
          throw new HttpError(HttpCode.UNAUTHORIZED, "unauthorizedRole");
      }
    }

    req.res.locals.user = data.user;
    req.res.locals.session = data.session;

    console.log('auth next');

    next();
  }
}

async function getAffectedUser(id: string) {
  if (!id)
    throw new HttpError(HttpCode.BAD_REQUEST, 'affectedUserIdParamNotFound');

  const user = await userModel.get(id);

  if (!user)
    throw new HttpError(HttpCode.NOT_FOUND, 'affectedUserNotFound');

  return user;
}