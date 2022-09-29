import { Request } from "express";
import { UserSession } from "../../auth";
import { User } from "../../models/auth/user/interface";

export type GetAllUsersRequest = Request<
  // params
  any,
  // response
  User[]
>;

export type GetInactiveUsersRequest = Request<
  // params
  any,
  // response
  User[]
>;

export type GetUsersByOrgunitRequest = Request<
  // params
  { orgunit_id: string },
  // response
  User[]
>;

export type GetUserByIdRequest = Request<
  // params
  { id: string },
  // response
  User
>;

export type UpdateUsernameRequest = Request<
  // params
  any,
  // response
  Date,
  // body
  { username: string },
  // query
  any,
  // locals
  UserSession
>;

export type UpdatePasswordRequest = Request<
  // params
  any,
  // response
  boolean,
  // body
  { currentPassword: string; newPassword: string; },
  // query
  any,
  // locals
  UserSession
>;

export type UpdateProfileRequest = Request<
  // params
  any,
  // response
  Date,
  // body
  { fullname: string; email: string; mobile: string; },
  // query
  any,
  // locals
  UserSession
>;

export type UpdateAvatarRequest = Request<
  // params
  any,
  // response
  { path: string },
  // body
  { avatar: string; },
  // query
  any,
  // locals
  UserSession
>; 