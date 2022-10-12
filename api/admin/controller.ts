import { getTopRole } from "../../auth/util";
import { HttpError } from "../../misc/errors";
import { HttpCode } from "../../misc/http-codes";
import usersModel from '../../models/auth/user';
import pubSub from "../../misc/pub-sub";
import {
  ActivateUserRequest,
  UpdateUserOrgunitRequest,
  CreateUserRequest,
  UpdateUserRolesRequest,
  UpdateUserGroupsRequest
} from "./interfaces";


export default {

  async createUser(req: CreateUserRequest) {
    const body = req.body;

    // only root user can create admins
    if (getTopRole(body.roles) === 1 && getTopRole(req.res.locals.user.roles) !== 0)
      throw new HttpError(HttpCode.UNAUTHORIZED, "unauthorizedRole");

    const user = await usersModel.create(
      req.body.orgunit,
      req.body.username,
      req.body.password,
      req.body.roles,
      req.body.groups
    );

    if (!user)
      throw new HttpError(HttpCode.UNKNOWN_ERROR, "errorCreatingUser");

    req.res.json(user);

    pubSub.emit("publish", {
      action: req.res.locals.action,
      entities_ids: [user.id],
      orgunit: user.orgunit_id,
      roles: [0, 1],
      issuer: req.res.locals.user.id
    });
  },

  async activateUser(req: ActivateUserRequest) {
    const user_id = req.params.id;
    const state = +req.params.state;

    req.res.json(await usersModel.activate(user_id, state));

    pubSub.emit("publish", {
      action: req.res.locals.action,
      entities_ids: [user_id],
      roles: [0, 1],
      issuer: req.res.locals.user.id
    });
  },

  async updateRoles(req: UpdateUserRolesRequest) {
    const roles = req.body.roles;
    const user_id = req.params.id;

    // only root user can create admins
    if (getTopRole(roles) === 1 && getTopRole(req.res.locals.user.roles) !== 0)
      throw new HttpError(HttpCode.UNAUTHORIZED, "unauthorizedRole");

    await usersModel.updateRoles(user_id, roles);

    req.res.json(true);

    pubSub.emit("publish", {
      action: req.res.locals.action,
      to_id: user_id,
      roles: [0, 1],
      entities_ids: [user_id],
      issuer: req.res.locals.user.id
    });
  },

  async updateGroups(req: UpdateUserGroupsRequest) {
    const groups = req.body.groups;
    const user_id = req.params.id;

    await usersModel.updateGroups(user_id, groups);

    req.res.json(true);

    pubSub.emit("publish", {
      action: req.res.locals.action,
      to_id: user_id,
      roles: [0, 1],
      entities_ids: [user_id],
      issuer: req.res.locals.user.id
    });
  },

  async updateOrgunit(req: UpdateUserOrgunitRequest) {
    req.res.json(await usersModel.updateOrgunit(req.params.id, req.body.orgunit_id));

    pubSub.emit("publish", {
      action: req.res.locals.action,
      to_id: req.params.id,
      roles: [0, 1],
      orgunit: req.body.orgunit_id,
      entities_ids: [req.params.id],
      issuer: req.res.locals.user.id
    });
  }
}