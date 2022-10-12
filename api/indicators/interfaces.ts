import { Request } from "express";
import { UserSession } from "../../auth";
import { Indicator, IndicatorDocument } from "../../models/indicators/indicators/interface";

export type GetIndicatorsByTopicRequest = Request<
  // params
  { topic_id: string },
  // response
  Indicator[],
  // body
  null,
  // query
  null,
  // locals
  UserSession
>;

export type GetIndicatorsByOrgunitRequest = Request<
  // params
  { orgunit_id: string },
  // response
  Indicator[]
>;

export type GetIndicatorsByIdRequest = Request<
  // params
  { id: string },
  // response
  Indicator
>;

export type GetIndicatorsDocumentsRequest = Request<
  // params
  { id: string },
  // response
  IndicatorDocument[]
>;

export type CreateIndicatorRequest = Request<
  // params
  any,
  // response
  Indicator,
  // body
  Omit<
    Indicator, 
    'id' | 'create_date' | 'create_by' | 'update_date' | 'update_by' | 'is_active'
    > & { parent_id?: string }
>

export type AddIndicatorDocumentRequest = Request<
  // params
  { id: string },
  // response
  { path: string },
  // body
  {
    name_ar: string;
    name_en: string;
    document: any;
  }
>;

export type UpdateIndicatorRequest = Request<
  // params
  { id: string },
  // response
  Date,
  // body
  {
    name_ar: string;
    name_en: string;
    desc_ar?: string;
    desc_en?: string;
    unit_ar?: string;
    unit_en?: string;
  }
>

export type UpdateIndicatorOrgunitRequest = Request<
  // params
  { id: string },
  // response
  Date,
  // body
  { orgunit_id: string; }
>;

export type UpdateIndicatorTopicRequest = Request<
  // params
  { id: string },
  // response
  Date,
  // body
  { topic_id: string; }
>;

export type ActivateIndicatorRequest = Request<
  // params
  { id: string, state: string },
  // response
  Date
>;

export type UpdateIndicatorCategoriesRequest = Request<
  // params
  { id: string },
  // response
  boolean,
  // body
  { categories: string[]; }
>;

export type RemoveIndicatorDocuemntRequest = Request<
  // params
  { id: string },
  // response
  boolean,
  // body
  { path: string; }
>; 