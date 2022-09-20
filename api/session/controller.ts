import config from '../../config';
import { NextFunction, Request, Response } from 'express';
import authModel from '../../models/auth/auth/index';
import usersModel from '../../models/auth/user/index';
import { sign } from 'jsonwebtoken';
import { TokenData, TokenType } from '../../auth/token';
import { HttpCode } from '../../misc/http-codes';
import { User } from '../../models/auth/user/interface';
import { Auth } from '../../models/auth/auth/interface';
import crypt from '../../auth/crypt';
import { HttpError } from '../../misc/errors';
import { LoginBody } from './interfaces';
import { ResLocals } from '../../auth/interfaces';

export default {

  async login(req: Request<any, any, LoginBody>, res: Response, next: NextFunction) {
    const body = req.body;
    let user: User | null;
    let userAuth: Auth | null;

    try {
      user = await usersModel.getByUsername(body.username);
    } catch (error) {
      return next(error);
    }

    if (!user)
      return next(new HttpError(HttpCode.NOT_FOUND, "userNotFound"));

    try {
      userAuth = await authModel.getPassword(user.ID);
    } catch (error) {
      return next(error);
    }

    if (!userAuth)
      return next(new HttpError(HttpCode.NOT_FOUND, "userAuthNotFound"));

    if (!(await crypt.verify(body.password, userAuth.PASSWORD, userAuth.SALT)))
      return next(new HttpError(HttpCode.UNAUTHORIZED, "wrongPassword"));

    const token = sign({
      id: user.ID,
      type: TokenType.SESSION
    } as TokenData, config.tokenSecret);

    try {
      await authModel.setToken(user.ID, token, body.remember ? config.rememberSessionTokenExpiry : config.sessionTokenExpiry);
    } catch (error) {
      return next(error);
    }

    res.json({ user, token });
  },

  async verifySession(_: Request, res: Response<any, ResLocals>, next: NextFunction) {
    const newToken = sign({
      id: res.locals.user.ID,
      type: TokenType.SESSION
    } as TokenData, config.tokenSecret);

    try {
      await authModel.setToken(
        res.locals.user.ID,
        newToken,
        res.locals.session.TOKEN_EXP_DATE.getTime() - res.locals.session.TOKEN_CREATE_DATE.getTime()
      );
    } catch (error) {
      return next(error);
    }

    return res.json({
      user: res.locals.user,
      token: newToken
    });
  },

  async logout(_: Request, res: Response<any, ResLocals>, next: NextFunction) {
    try {
      await authModel.endSession(res.locals.user.ID);      
    } catch (error) {
      return next(error);
    }

    res.json(true);
  }
}