import config from '../../config';
import authModel from '../../models/auth/auth/index';
import usersModel from '../../models/auth/user/index';
import { sign } from 'jsonwebtoken';
import { TokenData, TokenType } from '../../auth/token';
import { HttpCode } from '../../misc/http-codes';
import crypt from '../../auth/crypt';
import { HttpError } from '../../misc/errors';
import { LoginRequest, LogoutRequest, VerifySessionRequest } from './interfaces';

export default {

  async login(req: LoginRequest) {
    const user = await usersModel.getByUsername(req.body.username);

    if (!user)
      throw new HttpError(HttpCode.NOT_FOUND, "userNotFound");

    const userAuth = await authModel.getPassword(user.ID);

    if (!userAuth)
      throw new HttpError(HttpCode.NOT_FOUND, "userAuthNotFound");

    if (!(await crypt.verify(req.body.password, userAuth.PASSWORD, userAuth.SALT)))
      throw new HttpError(HttpCode.UNAUTHORIZED, "wrongPassword");

    const token = sign({
      id: user.ID,
      type: TokenType.SESSION
    } as TokenData, config.tokenSecret);

    await authModel.setToken(user.ID, token, req.body.remember ? config.rememberSessionTokenExpiry : config.sessionTokenExpiry);

    req.res.json({ user, token });
  },

  async verifySession(req: VerifySessionRequest) {
    const newToken = sign({
      id: req.res.locals.user.ID,
      type: TokenType.SESSION
    } as TokenData, config.tokenSecret);

    await authModel.setToken(
      req.res.locals.user.ID,
      newToken,
      req.res.locals.session.TOKEN_EXP_DATE.getTime() - req.res.locals.session.TOKEN_CREATE_DATE.getTime()
    );

    return req.res.json({
      user: req.res.locals.user,
      token: newToken
    });
  },

  async logout(req: LogoutRequest) {
    req.res.json(await authModel.endSession(req.res.locals.user.ID));
  }
}