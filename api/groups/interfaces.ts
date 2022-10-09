import { Request } from "express";
import { Role } from "../../auth/roles";
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
  { orgunit_id: string, name_ar: string; name_en: string; roles: Role[]; }
>;

export type UpdateGroupRequest = Request<
  // params
  { id: string },
  // response
  boolean,
  // body
  { name_ar: string; name_en: string; }
>;

export type UpdateGroupRolesRequest = Request<
  // params
  { id: string },
  // response
  boolean,
  // body
  { roles: Role[] }
>;

export type UpdateGroupOrgunitRequest = Request<
  // params
  { id: string },
  // response
  boolean,
  // body
  { orgunit_id: string; }
>;