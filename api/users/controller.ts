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
  async get(req: Request<{ id: string }>, res: Response, next: NextFunction) {
    try {
      res.json(await usersModel.get(req.params.id));

    } catch (error) {
      next(error);
    }
  },

  async getAll(_: Request, res: Response, next: NextFunction) {
    try {
      res.json(await usersModel.getAll(1));

    } catch (error) {
      next(error);
    }
  },

  async getInactive(_: Request, res: Response, next: NextFunction) {
    try {
      res.json(await usersModel.getAll(0));

    } catch (error) {
      next(error);
    }
  },

  async getByOrgunit(req: Request<{ id: string }>, res: Response, next: NextFunction) {
    try {
      res.json(await usersModel.getByOrgunit(req.params.id));

    } catch (error) {
      next(error);
    }
  },

  async updateUsername(req: Request<any, any, ChangeUsernameBody>, res: Response<any, ResLocals>, next: NextFunction) {
    try {
      const date = await usersModel.updateUsername(res.locals.user.ID, req.body.username);

      res.json(date);

    } catch (error) {
      next(error);
    }
  },

  async updatePassword(req: Request<any, any, ChangePasswordBody>, res: Response<any, ResLocals>, next: NextFunction) {
    const userAuth = await authModel.getPassword(res.locals.user.ID);

    if (!userAuth)
      return next(new HttpError(HttpCode.NOT_FOUND, "userAuthNotFound"));

    if (!(await crypt.verify(req.body.currentPassword, userAuth.PASSWORD, userAuth.SALT)))
      return next(new HttpError(HttpCode.UNAUTHORIZED, "wrongPassword"));


    try {
      const [password, salt] = await crypt.hash(req.body.newPassword);

      await authModel.updatePassword(res.locals.user.ID, password, salt);

      res.json(true);

    } catch (error) {
      next(error);
    }
  },

  async updateProfile(req: Request<any, any, UpdateProfileBody>, res: Response<any, ResLocals>, next: NextFunction) {
    try {
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

    } catch (error) {
      next(error);
    }
  },

  async updateAvatar(req: Request, res: Response<any, ResLocals>, next: NextFunction) {
    try {
      const path = '/uploads/avatars/' + req.file?.filename;

      await usersModel.updateAvatar(res.locals.user.ID, path);

      res.json(path);

    } catch (error) {
      next(error);
    }
  }
}