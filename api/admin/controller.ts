import manager from "../../auth/roles/manager";
import { HttpError } from "../../misc/errors";
import { HttpCode } from "../../misc/http-codes";
import usersModel from '../../models/auth/user';
import pubSub from "../../misc/pub-sub";
import {
  ActivateUserRequest,
  UpdateUserOrgunitRequest,
  CreateUserRequest,
  UpdateUserGroupsRequest,
  UpdateUserRolesRequest
} from "./interfaces";


export default {

  async createUser(req: CreateUserRequest) {
    const body = req.body;

    if (manager.getTopRole(req.res.locals.user.roles) >= manager.getTopRole(body.roles))
      throw new HttpError(HttpCode.UNAUTHORIZED, "unauthorizedRole");

    const user = await usersModel.create(
      req.body.orgunit,
      req.body.username,
      req.body.roles,
      req.body.password
    );

    if (!user)
      throw new HttpError(HttpCode.UNKNOWN_ERROR, "errorCreatingUser");

    req.res.json(user);

    pubSub.emit("publish", {
      action: req.res.locals.action,
      entity_id: user.id,
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
      entity_id: user_id,
      roles: [0, 1],
      issuer: req.res.locals.user.id
    });
  },

  async updateRoles(req: UpdateUserRolesRequest) {
    const roles = req.body.roles;
    const user_id = req.params.id;

    if (manager.getTopRole(req.res.locals.user.roles) >= manager.getTopRole(roles))
      throw new HttpError(HttpCode.UNAUTHORIZED, "unauthorizedRole");

    await usersModel.replaceRoles(user_id, roles);

    req.res.json(true);

    pubSub.emit("publish", {
      action: req.res.locals.action,
      to_id: user_id,
      roles: [0, 1],
      entity_id: user_id,
      issuer: req.res.locals.user.id
    });

  },

  async updateGroups(req: UpdateUserGroupsRequest) {
    const groups = req.body.groups;
    const user_id = req.params.id;

    await usersModel.replaceGroups(user_id, groups);

    req.res.json(true);

    pubSub.emit("publish", {
      action: req.res.locals.action,
      to_id: user_id,
      roles: [0, 1],
      entity_id: user_id,
      issuer: req.res.locals.user.id
    });

  },

  async updateOrgunit(req: UpdateUserOrgunitRequest) {
    req.res.json(await usersModel.updateOrgunit(req.params.id, req.body.orgunit));

    pubSub.emit("publish", {
      action: req.res.locals.action,
      to_id: req.params.id,
      roles: [0, 1],
      orgunit: req.body.orgunit,
      entity_id: req.params.id,
      issuer: req.res.locals.user.id
    });
  }
}