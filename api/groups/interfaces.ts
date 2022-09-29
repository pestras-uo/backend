import { Request } from "express";
import { Group } from "../../models/auth/groups/interface";

export type GetAllGroupsRequest = Request<
  // params
  any,
  // response
  Group[]
>;

export type GetGroupByIdRequest = Request<
  // params
  { id: string },
  // response
  Group
>;

export type CreateGroupRequest = Request<
  // params
  any,
  // response
  Group,
  // body
  { name_ar: string; name_en: string; }
>;

export type UpdateGroupRequest = Request<
  // params
  { id: string },
  // response
  boolean,
  // body
  { name_ar: string; name_en: string; }
>;