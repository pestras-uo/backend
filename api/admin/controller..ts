import { NextFunction, Request, Response } from "express";
import crypt from "../../auth/crypt";
import { ResLocals } from "../../auth/interfaces";
import manager from "../../auth/roles/manager";
import { HttpError } from "../../misc/errors";
import { HttpCode } from "../../misc/http-codes";
import { ChangeOrgunit, CreateUserBody, UpdateGroupsBody, UpdateRolesBody } from "./interfaces";
import authModel from '../../models/auth/auth';
import usersModel from '../../models/auth/user';
import pubSub from "../../misc/pub-sub";


export default {

  async createUser(req: Request<any, any, CreateUserBody>, res: Response<any, ResLocals>, next: NextFunction) {
    const body = req.body;

    if (manager.getTopRole(res.locals.user.ROLES) >= manager.getTopRole(body.roles))
      return next(new HttpError(HttpCode.UNAUTHORIZED, "unauthorizedRole"));

    const [password, salt] = await crypt.hash(req.body.password);

    try {
      const user = await usersModel.create(req.body.orgunit, req.body.username);

      if (!user)
        return next(new HttpError(HttpCode.UNKNOWN_ERROR, "errorCreatingUser"));

      await authModel.create(user?.ID!, password, salt);
      await usersModel.assignRoles(user.ID, req.body.roles);

      return res.json(user);

    } catch (error) {
      return next(error);
    }
  },

  async activateUser(req: Request<{ id: string, state: string }>, res: Response, next: NextFunction) {
    const user_id = req.params.id;
    const state = +req.params.state;

    try {
      await usersModel.activate(user_id, state);

    } catch (error) {
      return next(error);
    }

    res.json(true);
  },

  async updateRoles(req: Request<{ id: string }, any, UpdateRolesBody>, res: Response<any, ResLocals>, next: NextFunction) {
    const roles = req.body.roles;
    const user_id = req.params.id;

    console.log(res.locals.user.ROLES, roles);
    if (manager.getTopRole(res.locals.user.ROLES) >= manager.getTopRole(roles))
      return next(new HttpError(HttpCode.UNAUTHORIZED, "unauthorizedRole"));

    try {
      await usersModel.removeAllRoles(user_id);
      await usersModel.assignRoles(user_id, roles);

    } catch (error) {
      return next(error);
    }

    pubSub.emit("sse.message", {
      toId: user_id,
      data: {
        action: "user_role.update",
        roles
      }
    });

    res.json(true);
  },

  async updateGroups(req: Request<{ id: string }, any, UpdateGroupsBody>, res: Response<any, ResLocals>, next: NextFunction) {
    const groups = req.body.groups;
    const user_id = req.params.id;

    try {
      await usersModel.removeAllGroups(user_id);
      await usersModel.assignGroups(user_id, groups);
      
    } catch (error) {
      return next(error);
    }

    pubSub.emit("sse.message", {
      toId: user_id,
      data: {
        action: "user_role.update",
        groups
      }
    });

    res.json(true);
  },

  async updateOrgunit(req: Request<{ id: string }, any, ChangeOrgunit>, res: Response, next: NextFunction) {
    const orgId = req.body.orgunit;
    const user_id = req.params.id;

    try {
      const date = await usersModel.updateOrgunit(user_id, orgId);
      
      res.json(date);

    } catch (error) {
      return next(error);
    }
  }
}