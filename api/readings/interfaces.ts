import { Request } from "express";
import { IndicatorReading, ReadingDocument } from "../../models/readings/interface";

export type GetReadingsRequest = Request<
  // params
  { ind_id: string },
  // response
  IndicatorReading[],
  // body
  null,
  // query
  {
    offset: string;
    limit: string;
  }
>;

export type GetReadingByIdRequest = Request<
  // params
  { ind_id: string, id: string },
  // response
  IndicatorReading
>;

export type CreateReadingRequest = Request<
  // params
  { ind_id: string },
  // response
  IndicatorReading,
  // body
  {
    reading_value: number;
    reading_date: Date;
    note_ar?: string;
    note_en?: string;
  }
>;

export type UpdateReadingRequest = Request<
  // params
  { ind_id: string, id: string },
  // response
  Date,
  // body
  {
    reading_value: number;
    reading_date: Date;
    note_ar?: string;
    note_en?: string;
  }
>;

export type ApproveReadingRequest = Request<
  // params
  { ind_id: string, id: string, state: string },
  // response
  Date
>;

export type DeleteReadingRequest = Request<
  // params
  { ind_id: string, id: string },
  // response
  boolean
>;

export type GetReadingCategoriesRequest = Request<
  // params
  { id: string },
  // response
  string[]
>;

export type updateReadingCategoriesRequest = Request<
  // params
  { ind_id: string, id: string },
  any,
  // body
  { categories: string[]; }
>;

export type GetReadingDocumentsRequest = Request<
  // params
  { ind_id: string, id: string },
  // response
  ReadingDocument[]
>;

export type AddReadingDocumentRequest = Request<
  // params
  { ind_id: string, id: string },
  // response
  { path: string },
  // body
  {
    name_ar: string;
    name_en: string;
    document: any;
  }
>;

export type deleteReadingDocumentRequest = Request<
  // params
  { id: string },
  // reponse
  boolean,
  // body
  { path: string; }
>