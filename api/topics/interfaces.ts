import { Request } from "express";
import { Topic, TopicDocument } from "../../models/core/topics/interface";

export type GetAllTopicsRequest = Request<
  // params
  any,
  // response
  Topic[]
>;

export type GetTopicByIdRequest = Request<
  // params
  { id: string },
  // response
  Topic
>;

export type CreateTopicRequest = Request<
  // params
  any,
  // response
  Topic,
  // body
  {
    name_ar: string;
    name_en: string;
    desc_ar?: string;
    desc_en?: string;
    parent?: string;
  }
>;

export type UpdateTopicRequest = Request<
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
  }
>; 

export type UpdateTopicGroupsRequest = Request<
  // params
  { id: string },
  // response
  boolean,
  // body
  { groups: string[]; }
>; 

export type UpdateTopicCategoriesRequest = Request<
  // params
  { id: string },
  // response
  boolean,
  // body
  { categories: string[]; }
>; 

export type GetTopicDocumentsRequest = Request<
  // params
  { id: string },
  // response
  TopicDocument[]
>;

export type AddTopicDocumentRequest  = Request<
  // params
  { id: string },
  // response
  { path: string },
  // body
  { name_ar: string, name_en: string, document: any }
>;

export type deleteTopicDocumentRequest = Request<
  // params
  { id: string },
  // response
  boolean,
  // body
  { path: string; }
>; 