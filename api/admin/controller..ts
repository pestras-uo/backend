import { NextFunction, Request, Response } from "express";
import crypt from "../../auth/crypt";
import { ResLocals } from "../../auth/interfaces";
import manager from "../../auth/roles/manager";
import { HttpError } from "../../misc/errors";
import { HttpCode } from "../../misc/http-codes";
import { ChangeOrgunit, CreateUserBody, UpdateRolesBody } from "./interfaces";
import authModel from '../../models/auth/auth';
import usersModel from '../../models/auth/user';
import pubSub from "../../misc/pub-sub";


export default {

  async createUser(req: Request<any, any, CreateUserBody>, res: Response<any, ResLocals>, next: NextFunction) {
    const body = req.body;
    const orgId = body.orgunit;

    if (manager.getTopRole(res.locals.user.ROLES.map(r => r.ID)) <= manager.getTopRole(body.roles))
      return next(new HttpError(HttpCode.UNAUTHORIZED, "unauthorizedRole"));

    const [password, salt] = await crypt.hash(req.body.password);

    const user = await usersModel.create(req.body.orgunit, req.body.username);

    if (!user)
      return next(new HttpError(HttpCode.UNKNOWN_ERROR, "errorCreatingUser"));

    await authModel.create(user?.ID!, password, salt);
    await usersModel.assignRoles(user.ID, req.body.roles);

    return res.json(true);
  },

  async activateUser(req: Request<{ id: string, state: string }>, res: Response) {
    const user_id = +req.params.id;
    const state = +req.params.state;

    await usersModel.activate(user_id, state);

    res.json(true);
  },

  async updateRoles(req: Request<{ id: string }, any, UpdateRolesBody>, res: Response<any, ResLocals>, next: NextFunction) {
    const roles = req.body.roles;
    const user_d = +req.params.id;

    if (manager.getTopRole(res.locals.user.ROLES.map(r => r.ID)) <= manager.getTopRole(roles))
      return next(new HttpError(HttpCode.UNAUTHORIZED, "unauthorizedRole"));

    const date = await usersModel.assignRoles(user_d, roles);

    pubSub.emit("sse.message", {
      toId: user_d,
      data: {
        action: "user_role.update",
        roles
      }
    });

    res.json(date);
  },

  async updateOrgunit(req: Request<{ id: string }, any, ChangeOrgunit>, res: Response, next: NextFunction) {
    const orgId = req.body.orgunit;
    const user_id = +req.params.id;

    const date = await usersModel.updateOrgunit(user_id, orgId);

    res.json(date);
  }
}