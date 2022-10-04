import { Request } from "express";
import { IndicatorReading, ReadingDocument } from "models/indicators/readings/interface";

export type GetIndicatorReadingsRequest = Request<
  // params
  { id: string },
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
  { id: string, reading_id: string },
  // response
  IndicatorReading
>;

export type GetReadingDocumentsRequest = Request<
  // params
  { id: string, reading_id: string },
  // response
  ReadingDocument[]
>;

export type InsertReadingRequest = Request<
  // params
  { id: string },
  // response
  string,
  // body
  { 
    reading_value: string, 
    note_ar?: string, 
    note_en?: string, 
    [key: string]: any 
  }
>;

export type UpdateReadingRequest = Request<
  // params
  { id: string, reading_id: string },
  // response
  boolean,
  // body
  {
    reading_value: number;
    note_ar?: string;
    note_en?: string;
    [key: string]: any;
  }
>;

export type ApproveReadingRequest = Request<
  // params
  { id: string, reading_id: string, state: string },
  // response
  boolean
>;

export type AddReadingDocumentRequest = Request<
  // params
  { id: string, reading_id: string },
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