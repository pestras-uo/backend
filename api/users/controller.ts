import { NextFunction, Request, Response } from "express";
import { ResLocals } from "../../auth/interfaces";
import { ChangePasswordBody, ChangeUsernameBody, UpdateProfileBody } from "./interfaces";
import usersModel from '../../models/auth/user';
import authModel from '../../models/auth/auth';
import pubSub from "../../misc/pub-sub";
import { HttpError } from "../../misc/errors";
import { HttpCode } from "../../misc/http-codes";
import crypt from "../../auth/crypt";

export default {
  async get(req: Request<{ id: string }>, res: Response) {
    res.json(await usersModel.get(req.params.id));
  },
  
  async getAll(_: Request, res: Response) {
    res.json(await usersModel.getAll(1));
  },
  
  async getInactive(_: Request, res: Response) {
    res.json(await usersModel.getAll(0));
  },

  async getByOrgunit(req: Request<{ id: string }>, res: Response) {
    res.json(await usersModel.getByOrgunit(req.params.id));
  },

  async changeUsername(req: Request<any, any, ChangeUsernameBody>, res: Response<any, ResLocals>) {
    const date = await usersModel.updateUsername(res.locals.user.ID, req.body.username);

    res.json(date);
  },

  async changePassword(req: Request<any, any, ChangePasswordBody>, res: Response<any, ResLocals>, next: NextFunction) {
    const userAuth = await authModel.getPassword(res.locals.user.ID);

    if (!userAuth)
      return next(new HttpError(HttpCode.NOT_FOUND, "userAuthNotFound"));

    if (!(await crypt.verify(req.body.currentPassword, userAuth.PASSWORD, userAuth.SALT)))
      return next(new HttpError(HttpCode.UNAUTHORIZED, "wrongPassword"));

    const [password, salt] = await crypt.hash(req.body.newPassword);

    await authModel.updatePassword(res.locals.user.ID, password, salt);

    res.json(true);
  },

  async updateProfile(req: Request<any, any, UpdateProfileBody>, res: Response<any, ResLocals>) {
    const date = await usersModel.updateProfile(
      res.locals.user.ID,
      req.body.fullname,
      req.body.email,
      req.body.mobile
    );

    pubSub.emit("sse.newEmail", {
      groups: ['admins'],
      data: {
        id: res.locals.user.ID,
        profile: req.body
      }
    });

    res.json(date);
  },

  async updateAvatar(req: Request, res: Response<any, ResLocals>) {
    const path = '/public/uploads/documents/' + req.file?.filename;

    res.json(await usersModel.updateAvatar(res.locals.user.ID, path));
  }
}