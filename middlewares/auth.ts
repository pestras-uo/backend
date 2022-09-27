import { NextFunction, Request, Response } from "express";
import { HttpCode } from "../misc/http-codes";
import { TokenMeta, TokenType, verifyToken } from '../auth/token';
import { Action } from "../auth/roles/actions";
import RolesManager from "../auth/roles/manager";
import { HttpError } from "../misc/errors";
import userModel from '../models/auth/user';
import { UserDetails } from "../models/auth/user/interface";

export default function (actions: Action[] = [], tokenType = TokenType.SESSION) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const affectedUserId = (req.baseUrl + req.path).startsWith('/api/admin') ? req.params.id : null;

    let authHeader = req.header("Authorization");

    if (!authHeader)
      return next(new HttpError(HttpCode.TOKEN_REQUIRED, "unauthorized"));

    const token = authHeader.split(" ")[1];

    let data: { user: UserDetails, session: TokenMeta } | null | undefined;

    try {
      data = await verifyToken(token, tokenType);      
    } catch (error) {
      return next(error);
    }

    if (!data)
      return next(new HttpError(HttpCode.INVALID_TOKEN, "invalidToken"));

    if (!data.user.IS_ACTIVE)
      return next(new HttpError(HttpCode.UNAUTHORIZED, 'userIsInactive'));

    if (actions?.length > 0) {

      if (affectedUserId) {
        let affectedUser: UserDetails;
        try {
          affectedUser = await getAffectedUser(affectedUserId);          
        } catch (error) {
          return next(error);
        }

        if (!RolesManager.authorize(data.user, actions, affectedUser))
          return next(new HttpError(HttpCode.UNAUTHORIZED, "unauthorizedRole"));

      } else {
        console.log('authorize:', RolesManager.authorize(data.user, actions));
        if (!RolesManager.authorize(data.user, actions))
          return next(new HttpError(HttpCode.UNAUTHORIZED, "unauthorizedRole"));
      }
    }

    res.locals.user = data.user;
    res.locals.session = data.session;

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