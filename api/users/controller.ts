import { NextFunction, Request, Response } from "express";
import { ResLocals } from "../../auth/interfaces";
import { ChangeEmailBody, ChangePasswordBody, ChangeUsernameBody, UpdateProfileBody } from "./interfaces";
import usersModel from '../../models/auth/user';
import authModel from '../../models/auth';
import pubSub from "../../misc/pub-sub";
import { sign } from "jsonwebtoken";
import { TokenData, TokenType } from "../../auth/token";
import config from "../../config";
import { HttpError } from "../../misc/errors";
import { HttpCode } from "../../misc/http-codes";
import crypt from "../../auth/crypt";
import { ObjectId } from "mongodb";

export default {
  async get(req: Request<{ id: string }>, res: Response, next: NextFunction) {
    let id: ObjectId;

    try {
      id = new ObjectId(req.params.id);  
    } catch (error) {
      return next(new HttpError(HttpCode.BAD_REQUEST, "invalidUserId"));
    }

    res.json(await usersModel.get(id));
  },
  
  async getMany(req: Request, res: Response) {
    res.json(await usersModel.getMany(
      { active: true },
      { username: 1, email: 1, fullname: { $concat: ["$profile.firstname", " ", "$profile.lastname"] } })
    );
  },

  async getByOrganziation(req: Request<{ id: string }>, res: Response) {
    res.json(await usersModel.getMany(
      { active: true, organization: new ObjectId(req.params.id) },
      { username: 1, email: 1, organization: 1, fullname: { $concat: ["$profile.firstname", " ", "$profile.lastname"] } })
    );
  },
  
  async getInactive(req: Request, res: Response) {
    res.json(await usersModel.getMany(
      { active: false },
      { username: 1, email: 1, fullname: { $concat: ["$profile.firstname", " ", "$profile.lastname"] } })
    );
  },

  async changeUsername(req: Request<any, any, ChangeUsernameBody>, res: Response<any, ResLocals>) {
    const date = await usersModel.updateUsername(res.locals.user._id!, req.body.username);

    res.json(date);
  },

  async changeEmail(req: Request<any, any, ChangeEmailBody>, res: Response<any, ResLocals>) {
    const date = await usersModel.updateEmail(res.locals.user._id!, req.body.email, req.body.isBackup);

    const token = sign({
      _id: res.locals.user._id!.toHexString(),
      type: TokenType.EMAIL,
      payload: req.body.email
    } as TokenData, config.tokenSecret);

    pubSub.emit("email.verifyEmail", {
      data: { user: res.locals.user, token }
    });

    if (!req.body.isBackup)
      pubSub.emit("sse.newEmail", {
        groups: ['admins'],
        data: {
          id: res.locals.user._id!.toHexString(),
          email: req.body.email
        }
      });

    res.json(date);
  },

  async changePassword(req: Request<any, any, ChangePasswordBody>, res: Response<any, ResLocals>, next: NextFunction) {
    const userAuth = await authModel.getPassword(res.locals.user._id!);

    if (!userAuth)
      return next(new HttpError(HttpCode.NOT_FOUND, "userAuthNotFound"));

    if (!(await crypt.verify(req.body.currentPassword, userAuth.password, userAuth.salt)))
      return next(new HttpError(HttpCode.UNAUTHORIZED, "wrongPassword"));

    const [password, salt] = await crypt.hash(req.body.newPassword);

    await authModel.updatePassword(res.locals.user._id!, password, salt);

    res.json(true);
  },

  async updateProfile(req: Request<any, any, UpdateProfileBody>, res: Response<any, ResLocals>) {
    const date = await usersModel.updateProfile(res.locals.user._id!, req.body);

    pubSub.emit("sse.newEmail", {
      groups: ['admins'],
      data: {
        id: res.locals.user._id!.toHexString(),
        profile: req.body
      }
    });

    res.json(date);
  }
}