import config from '../../config';
import { NextFunction, Request, Response } from 'express';
import authModel from '../../models/auth/index';
import usersModel from '../../models/user/index';
import organziationsModel from '../../models/organization';
import { sign } from 'jsonwebtoken';
import { TokenData, TokenType } from '../../auth/token';
import { HttpCode } from '../../misc/http-codes';
import { User, UserProfile } from '../../models/user/doc';
import { Auth } from '../../models/auth/doc';
import { ObjectId } from 'mongodb';
import crypt from '../../auth/crypt';
import pubSub from '../../misc/pub-sub';
import { HttpError } from '../../misc/errors';
import { LoginBody, ResendActiviationEmailBody, ResetPasswordBody, SignUpBody } from './interfaces';
import { ResLocals } from '../../auth/interfaces';
import { Organization } from '../../models/organization/doc';

export default {

  async login(req: Request<any, any, LoginBody>, res: Response, next: NextFunction) {
    const body = req.body;
    let user: User | null;
    let userAuth: Auth | null;

    if (body.usernameOrEmail.includes("@"))
      user = await usersModel.getByUsername(body.usernameOrEmail)
    else
      user = await usersModel.getByEmail(body.usernameOrEmail);

    if (!user)
      return next(new HttpError(HttpCode.NOT_FOUND, "userNotFound"));

    userAuth = await authModel.getPassword(user._id as ObjectId);

    // Todo: delete user
    if (!userAuth)
      return next(new HttpError(HttpCode.NOT_FOUND, "userAuthNotFound"));

    if (!(await crypt.verify(body.password, userAuth.password, userAuth.salt)))
      return next(new HttpError(HttpCode.UNAUTHORIZED, "wrongPassword"));

    const token = sign({
      _id: user._id?.toHexString(),
      type: TokenType.API,
      date: Date.now(),
      remember: body.remember
    } as TokenData, config.tokenSecret);

    await authModel.addSession(user._id!, token);

    res.json({ user, token });
  },

  async verifySession(_: Request, res: Response<any, ResLocals>) {
    const newToken = sign({
      _id: res.locals.user._id!.toHexString(),
      type: TokenType.API,
      date: res.locals.tokenData.date,
      remember: res.locals.tokenData.remember
    } as TokenData, config.tokenSecret);

    await authModel.updateSession(res.locals.user._id!, res.locals.token, newToken);

    return res.json({
      user: res.locals.user,
      token: newToken
    });
  },

  async signup(req: Request<any, any, SignUpBody>, res: Response<any, ResLocals>) {
    const [password, salt] = await crypt.hash(req.body.password);

    const organization = new Organization(req.body.organization);
    organization._id = await organziationsModel.create(organization);

    let user = new User(
      organization._id,
      [req.body.email, false],
      req.body.username,
      new UserProfile(req.body.title, req.body.firstname, req.body.lastname)
    );

    user.profile.emails = [req.body.email];

    user = await usersModel.create(user);

    await authModel.create(user._id!, password, salt);

    const token = sign({
      _id: res.locals.user._id!.toHexString(),
      type: TokenType.EMAIL,
      date: Date.now(),
      payload: { email: res.locals.user.email[0] }
    } as TokenData, config.tokenSecret);

    pubSub.emit("auth.activation-email", {
      data: { user: res.locals.user, token }
    });

    return res.json(true);
  },

  async activateEmail(_: Request, res: Response<any, ResLocals>) {
    await usersModel.activateEmail(
      res.locals.user._id!,
      res.locals.tokenData.payload.email,
      res.locals.tokenData.payload.isBackupEmail
    );

    return res.json(true);
  },

  async resendActiviationEmail(req: Request<any, any, ResendActiviationEmailBody>, res: Response, next: NextFunction) {
    const user = await usersModel.getByEmail(req.body.email, { email: 1, username: 1 });

    if (!user)
      return next(new HttpError(HttpCode.NOT_FOUND, "emailNotFound"));

    const userAuth = await authModel.getPassword(user._id);

    if (!userAuth)
      return next(new HttpError(HttpCode.NOT_FOUND, "emailNotFound"));

    if (!(await crypt.verify(req.body.password, userAuth.password, userAuth.salt)))
      return next(new HttpError(HttpCode.NOT_FOUND, "wrongPassword"));

    const token = sign({
      _id: user._id.toHexString(),
      type: TokenType.EMAIL,
      date: Date.now(),
      payload: { email: user.email }
    } as TokenData, config.tokenSecret);

    pubSub.emit("auth.activation-email", {
      data: { user: user, token }
    });

    res.json(true);
  },

  forgotPassword(_: Request, res: Response<any, ResLocals>) {
    const token = sign({
      _id: res.locals.user._id!.toHexString(),
      type: TokenType.PASSWORD,
      date: Date.now(),
      payload: { email: res.locals.user.email[0] }
    } as TokenData, config.tokenSecret);

    pubSub.emit("auth.forgot-password", {
      data: { user: res.locals.user, token }
    });

    res.json(true);
  },

  async resetPassword(req: Request<any, any, ResetPasswordBody>, res: Response) {
    const password: string = req.body.password;
    const [hashed, salt] = await crypt.hash(password);

    await authModel.updatePassword(res.locals.user._id, hashed, salt);
    return res.json(true);
  }
}