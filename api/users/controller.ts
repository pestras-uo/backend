import usersModel from '../../models/auth/user';
import authModel from '../../models/auth/auth';
import pubSub from "../../misc/pub-sub";
import { HttpError } from "../../misc/errors";
import { HttpCode } from "../../misc/http-codes";
import crypt from "../../auth/crypt";
import fs from 'fs';
import config from "../../config";
import path from 'path';
import {
  GetAllUsersRequest,
  GetInactiveUsersRequest,
  GetUserByIdRequest,
  UpdatePasswordRequest,
  UpdateUsernameRequest,
  UpdateProfileRequest,
  GetUsersByOrgunitRequest,
  UpdateAvatarRequest
} from "./interfaces";

export default {

  async getAll(req: GetAllUsersRequest) {
    req.res.json(await usersModel.getAll(1));
  },

  async getInactive(req: GetInactiveUsersRequest) {
    req.res.json(await usersModel.getAll(0));
  },

  async getByOrgunit(req: GetUsersByOrgunitRequest) {
    req.res.json(await usersModel.getByOrgunit(req.params.orgunit_id));
  },

  async get(req: GetUserByIdRequest) {
    req.res.json(await usersModel.get(req.params.id));
  },

  async updateUsername(req: UpdateUsernameRequest) {
    req.res.json(await usersModel.updateUsername(req.res.locals.user.id, req.body.username));

    pubSub.emit("publish", {
      action: req.res.locals.action,
      entity_id: req.res.locals.user.id,
      roles: [0, 1],
      issuer: req.res.locals.user.id
    });
  },

  async updatePassword(req: UpdatePasswordRequest) {
    const userAuth = await authModel.getPassword(req.res.locals.user.id);

    if (!userAuth)
      throw new HttpError(HttpCode.NOT_FOUND, "userAuthNotFound");

    if (!(await crypt.verify(req.body.currentPassword, userAuth.password, userAuth.salt)))
      throw new HttpError(HttpCode.UNAUTHORIZED, "wrongPassword");


    req.res.json(await authModel.updatePassword(req.res.locals.user.id, req.body.newPassword));
  },

  async updateProfile(req: UpdateProfileRequest) {
    req.res.json(await usersModel.updateProfile(
      req.res.locals.user.id,
      req.body.fullname,
      req.body.email,
      req.body.mobile
    ));

    pubSub.emit("publish", {
      action: req.res.locals.action,
      entity_id: req.res.locals.user.id,
      roles: [0, 1],
      issuer: req.res.locals.user.id
    });
  },

  async updateAvatar(req: UpdateAvatarRequest) {
    const avatarPath = '/uploads/avatars/' + req.file?.filename;

    await usersModel.updateAvatar(req.res.locals.user.id, avatarPath);

    if (req.res.locals.user.avatar) {
      const filename = req.res.locals.user.avatar.slice(req.res.locals.user.avatar.lastIndexOf('/') + 1);
      fs.unlinkSync(path.join(config.uploadsDir, 'avatars', filename));
    }

    req.res.json({ path: avatarPath });

    pubSub.emit("publish", {
      action: req.res.locals.action,
      entity_id: req.res.locals.user.id,
      roles: [0, 1],
      issuer: req.res.locals.user.id
    });
  }
}