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

    user = await usersModel.getByUsername(body.username);

    if (!user)
      return next(new HttpError(HttpCode.NOT_FOUND, "userNotFound"));

    userAuth = await authModel.getPassword(user.ID);

    // Todo: delete user
    if (!userAuth)
      return next(new HttpError(HttpCode.NOT_FOUND, "userAuthNotFound"));

    if (!(await crypt.verify(body.password, userAuth.PASSWORD, userAuth.SALT)))
      return next(new HttpError(HttpCode.UNAUTHORIZED, "wrongPassword"));

    const token = sign({
      id: user.ID,
      type: TokenType.API,
      date: Date.now(),
      remember: body.remember
    } as TokenData, config.tokenSecret);

    await authModel.setToken(user.ID, token);

    res.json({ user, token });
  },

  async verifySession(_: Request, res: Response<any, ResLocals>) {
    const newToken = sign({
      id: res.locals.user.ID,
      type: TokenType.API,
      date: res.locals.tokenData.date,
      remember: res.locals.tokenData.remember
    } as TokenData, config.tokenSecret);

    await authModel.setToken(res.locals.user.ID, newToken);

    return res.json({
      user: res.locals.user,
      token: newToken
    });
  }
}