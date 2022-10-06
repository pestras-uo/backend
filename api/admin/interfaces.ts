import { Request } from "express";
import { UserSession } from "../../auth";
import { UserDetails } from "../../models/auth/user/interface";

export type CreateUserRequest = Request<
  // params
  any, 
  // response
  UserDetails,
  // body
  {
    orgunit: string;
    username: string;
    password: string;
    roles: number[];
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
  boolean,
  // body
  { groups: string[]; }
>;

export type UpdateUserOrgunitRequest = Request<
  // params
  { id: string },
  // response
  Date,
  // body
  { orgunit: string; }
>;