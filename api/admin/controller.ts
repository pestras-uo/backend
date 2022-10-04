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

    return req.res.json(user);
  },

  async activateUser(req: ActivateUserRequest) {
    const user_id = req.params.id;
    const state = +req.params.state;

    req.res.json(await usersModel.activate(user_id, state));
  },

  async updateRoles(req: UpdateUserRolesRequest) {
    const roles = req.body.roles;
    const user_id = req.params.id;

    if (manager.getTopRole(req.res.locals.user.roles) >= manager.getTopRole(roles))
      throw new HttpError(HttpCode.UNAUTHORIZED, "unauthorizedRole");

    await usersModel.replaceRoles(user_id, roles);

    pubSub.emit("sse.message", {
      toId: user_id,
      data: {
        action: "user_role.update",
        roles
      }
    });

    req.res.json(true);
  },

  async updateGroups(req: UpdateUserGroupsRequest) {
    const groups = req.body.groups;
    const user_id = req.params.id;

    await usersModel.replaceGroups(user_id, groups);

    pubSub.emit("sse.message", {
      toId: user_id,
      data: {
        action: "user_role.update",
        groups
      }
    });

    req.res.json(true);
  },

  async updateOrgunit(req: UpdateUserOrgunitRequest) {    
    req.res.json(await usersModel.updateOrgunit(req.params.id, req.body.orgunit));
  }
}