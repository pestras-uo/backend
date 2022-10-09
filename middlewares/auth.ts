import { NextFunction, Request, Response } from "express";
import { TokenType } from '../auth/token';
import { authenticate } from "../auth";
import { Action } from "../auth/roles/actions";


export default function (action?: Action, tokenType = TokenType.SESSION) {

  return async (req: Request, _: Response, next: NextFunction) => {
    const token = req.header("Authorization")?.split(" ")[1] || (req.query.t as string);
    const data = await authenticate(token, tokenType, action, req.params.id, req.body);

    req.res.locals.action = action;
    req.res.locals.user = data.user;
    req.res.locals.session = data.session;

    next();
  }
}