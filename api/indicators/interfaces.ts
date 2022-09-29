import { Request } from "express";
import { Indicator, IndicatorDetails, IndicatorDocument } from "../../models/indicators/indicators/interface";

export type GetIndicatorsByTopicRequest = Request<
  // params
  { topic_id: string },
  // response
  Indicator[]
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
  IndicatorDetails
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
  IndicatorDetails,
  // body
  {
    orgunit_id: string;
    topic_id: string;

    name_ar: string;
    name_en: string;
    desc_ar?: string;
    desc_en?: string;
    unit_ar?: string;
    unit_en?: string;

    parent?: string;
  }
>

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

export type UpdateIndicatorGroupsRequest = Request<
  // params
  { id: string },
  // response
  boolean,
  // body
  { groups: string[]; }
>;

export type UpdateIndicatorCategoriesRequest = Request<
  // params
  { id: string },
  // response
  boolean,
  // body
  { categories: string[]; }
>;

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

export type RemoveIndicatorDocuemntRequest = Request<
  // params
  { id: string },
  // response
  boolean,
  // body
  { path: string; }
>; 