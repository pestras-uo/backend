import { Request } from "express";
import { UserSession } from "../../../auth";
import { ManualIndicatorReading, ReadingDocument } from "../../../models/indicators/readings/interface";

// GET
// --------------------------------------------------------------------------------
export type GetIndicatorReadingsRequest = Request<
  // params
  { id: string },
  // response
  any[],
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
  ManualIndicatorReading
>;

export type GetReadingDocumentsRequest = Request<
  // params
  { id: string, reading_id: string },
  // response
  ReadingDocument[]
>;




// POST
// --------------------------------------------------------------------------------
export type InsertReadingRequest = Request<
  // params
  { id: string },
  // response
  any,
  // body
  { [key: string]: any },
  // query
  null,
  // locals
  UserSession
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




// PUT
// --------------------------------------------------------------------------------
export type UpdateReadingRequest = Request<
  // params
  { id: string, reading_id: string },
  // response
  boolean,
  // body
  { [key: string]: any; },
  // query
  null,
  // locals
  UserSession
>;

export type ApproveReadingRequest = Request<
  // params
  { id: string, reading_id: string, state: string },
  // response
  boolean
>;




// DELETE
// --------------------------------------------------------------------------------
export type deleteReadingDocumentRequest = Request<
  // params
  { id: string, reading_id: string },
  // reponse
  boolean,
  // body
  { path: string; }
>