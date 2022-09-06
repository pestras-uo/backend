import { NextFunction, Request, Response } from "express";
import crypt from "../../auth/crypt";
import { ResLocals } from "../../auth/interfaces";
import manager from "../../auth/roles/manager";
import { HttpError } from "../../misc/errors";
import { HttpCode } from "../../misc/http-codes";
import { User, UserProfile } from "../../models/user/doc";
import { ChangeOrganziation, CreateUserBody, UpdateRolesBody } from "./interfaces";
import authModel from '../../models/auth';
import usersModel from '../../models/user';
import { sign } from "jsonwebtoken";
import { TokenData, TokenType } from "../../auth/token";
import config from "../../config";
import pubSub from "../../misc/pub-sub";
import { ObjectId } from "mongodb";


export default {

  async createUser(req: Request<any, any, CreateUserBody>, res: Response<any, ResLocals>, next: NextFunction) {
    const body = req.body;
    let orgId: ObjectId;

    if (manager.getTopRole(res.locals.user.roles) <= manager.getTopRole(body.roles))
      return next(new HttpError(HttpCode.UNAUTHORIZED, "unauthorizedRole"));

    try {
      orgId = new ObjectId(body.organization);
    } catch (error) {
      return next(new HttpError(HttpCode.BAD_REQUEST, "invalidOrganziationId"));
    }

    const [password, salt] = await crypt.hash(req.body.password);

    let user = new User(
      orgId,
      [req.body.email, false],
      req.body.username,
      new UserProfile(req.body.title, req.body.firstname, req.body.lastname)
    );

    user.roles = body.roles;
    user.profile.middlename = body.middlename;
    user.profile.emails = [body.email];
    user.profile.mobiles = body.mobiles;
    user.profile.address = body.address;
    user.profile.pobox = body.pobox;

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

  async activateUser(req: Request<{ id: string }>, res: Response, next: NextFunction) {
    const userId = new ObjectId(req.params.id);

    await usersModel.activate(userId);

    res.json(true);
  },

  async deactivateUser(req: Request<{ id: string }>, res: Response, next: NextFunction) {
    const userId = new ObjectId(req.params.id);

    await usersModel.deactivate(userId);

    pubSub.emit("sse.message", {
      toId: req.params.id,
      data: {
        action: "deactivate"
      }
    });

    res.json(true);
  },

  async updateRoles(req: Request<{ id: string }, any, UpdateRolesBody>, res: Response<any, ResLocals>, next: NextFunction) {
    const roles = req.body.roles;
    const userId = new ObjectId(req.params.id);

    if (manager.getTopRole(res.locals.user.roles) <= manager.getTopRole(roles))
      return next(new HttpError(HttpCode.UNAUTHORIZED, "unauthorizedRole"));

    pubSub.emit("sse.message", {
      toId: req.params.id,
      data: {
        action: "updateRoles",
        roles
      }
    });

    const date = await usersModel.updateRoles(userId, roles);

    res.json(date);
  },

  async updateOrganization(req: Request<{ id: string }, any, ChangeOrganziation>, res: Response, next: NextFunction) {
    const orgId = new ObjectId(req.body.organization);
    const userId = new ObjectId(req.params.id);

    const date = await usersModel.updateOrganziation(userId, orgId);

    res.json(date);
  }
}