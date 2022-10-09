import { Request } from "express";
import { UserSession } from "../../auth";
import { User } from "../../models/auth/user/interface";

export type CreateUserRequest = Request<
  // params
  any, 
  // response
  User,
  // body
  {
    orgunit: string;
    username: string;
    password: string;
    roles: number[];
    groups: string[];
  },
  // query,
  any,
  // locals
  UserSession
>;

export type ActivateUserRequest = Request<
  // params
  { id: string, state: string },
  // responce
  Date
>;

export type UpdateUserRolesRequest = Request<
  // params
  { id: string },
  // response
  boolean,
  // body
  { roles: number[]; },
  // query
  any,
  // locals
  UserSession
>;

export type UpdateUserGroupsRequest = Request<
  // params
  { id: string },
  // response
  boolean,
  // body
  { groups: string[]; },
  // query
  any,
  // locals
  UserSession
>;

export type UpdateUserOrgunitRequest = Request<
  // params
  { id: string },
  // response
  Date,
  // body
  { orgunit: string; }
>;