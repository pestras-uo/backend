import { Request } from "express";
import { UserSession } from "../../../auth";
import { ReadingColumn, IndConf, FilterOptions } from "../../../models/indicators/config/interface";

export type GetIndicatorConfigRequest = Request<
  // params
  { id: string },
  // response
  IndConf
>;

export type CreatManualIndicatorConfigRequest = Request<
  // params
  { id: string },
  // response
  IndConf,
  // body
  Omit<
    IndConf,
    'indicator_id' |
    'source_name' |
    'type' |
    'compute_options' |
    'filter_options' |
    'state'
  >
>;

export type CreateComputationalIndicatorRequest = Request<
  // params
  { id: string },
  // response
  IndConf,
  // body
  Omit<
    IndConf,
    'indicator_id' |
    'source_name' |
    'type' |
    'state' |
    'filter_options' |
    'columns'
  >
>;

export type CreateExternalIndicatorRequest = Request<
  // params
  { id: string },
  // response
  IndConf,
  // body
  Omit<
    IndConf,
    'indicator_id' |
    'type' |
    'evaluation_day' |
    'compute_options' |
    'state' 
  >
>;

export type SplitIndicatorRequest = Request<
  // params
  { id: string },
  // response
  string[],
  // body
  { categorial_column: string; },
  // query
  null,
  // locals
  UserSession
>;

export type UpdateIndicatorConfigRequest = Request<
  // params
  { id: string },
  // response
  boolean,
  // body
  Omit<
    IndConf,
    'indicator_id' |
    'source_name' |
    'type' |
    'state' |
    'compute_options' |
    'filter_options' |
    'columns'
  >
>;

export type UpdateIndicatorStateRequest = Request<
  // params
  { id: string, state: string },
  // response
  boolean
>;

export type UpdateExternalIndicatorRequest = Request<
  // params
  { id: string },
  // response
  boolean,
  // body
  {
    source_name: string;
    filter_options: FilterOptions;
    columns: ReadingColumn[];
  }
>;