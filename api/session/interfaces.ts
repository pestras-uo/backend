import { Request } from "express";
import { UserSession } from "../../auth";
import { User } from "../../models/auth/user/interface";

export type LoginRequest = Request<
  // params
  any,
  // response
  { user: User, token: string },
  // body
  { username: string; password: string; remember: boolean; }
>;

export type VerifySessionRequest = Request<
  // params
  any,
  // response
  { user: User, token: string },
  // body
  any,
  // query
  any,
  // locals
  UserSession
>;

export type LogoutRequest = Request<
  // params
  any,
  // response
  boolean,
  // body
  any,
  // query
  any,
  // locals
  UserSession
>;