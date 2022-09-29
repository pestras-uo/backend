import { Request } from "express";
import { Orgunit } from "../../models/core/orgunits/interface";

export type GetAllOrgunitsRequest = Request<
  // params
  any,
  // response
  Orgunit[]
>;

export type GetOrgunitsByIdRequest = Request<
  // params
  { id: string },
  // response
  Orgunit
>;

export type CreateOrganziationRequest = Request<
  // params
  any,
  // response
  Orgunit,
  // body
  { name_ar: string; name_en: string; parent_id?: string; }
>;

export type UpdateOrgunitRequest = Request<
  // params
  { id: string },
  // response
  Date,
  // body
  { name_ar: string; name_en: string; }
>;