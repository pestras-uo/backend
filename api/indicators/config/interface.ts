import { Request } from "express";
import { IndicatorArgument, IndicatorConfig, IndicatorInterval, ReadingColumn } from "../../../models/indicators/config/interface";

export type GetIndicatorConfigRequest = Request<
  // params
  { id: string },
  // response
  IndicatorConfig
>;

export type GetIndicatorArgsRequest = Request<
  // params
  { id: string },
  // response
  IndicatorArgument[]
>;

export type CreatManualIndicatorConfigRequest = Request<
  // params
  { id: string },
  // response
  boolean,
  // body
  {
    reading_value_name_ar: string;
    reading_value_name_en: string;

    intervals?: IndicatorInterval;
    evaluation_day?: number;
    require_approval: 0 | 1;

    kpi_min?: number;
    kpi_max?: number;

    additional_columns: Omit<ReadingColumn, 'id' | 'indicator_id'>[];
  }
>;

export type CreateComputationalIndicatorRequest = Request<
  // params
  { id: string },
  // response
  boolean,
  // body
  {
    reading_value_name_ar: string;
    reading_value_name_en: string;

    intervals?: IndicatorInterval;
    evaluation_day?: number;
    equation: string;
    match_by_columns?: string[][];

    kpi_min?: number;
    kpi_max?: number;

    args: Omit<IndicatorArgument, 'indicator_id'>[];
  }
>;

export type CreateViewIndicatorRequest = Request<
  // params
  { id: string },
  // response
  boolean,
  // body
  {
    reading_value_name_ar: string;
    reading_value_name_en: string;

    intervals?: IndicatorInterval;
    evaluation_day?: number;
    view_name: string;

    kpi_min?: number;
    kpi_max?: number;

    additional_columns: Omit<ReadingColumn, 'id' | 'indicator_id'>[];
  }
>;

export type UpdateIndicatorConfigRequest = Request<
  // params
  { id: string },
  // response
  boolean,
  // body
  { 
    reading_value_name_ar: string;
    reading_value_name_en: string;
    intervals: IndicatorInterval; 
    evaluation_day: number;
    require_approval?: 0 | 1;
    kpi_min?: number;
    kpi_max?: number;
  }
>;

export type UpdateIndicatorStateRequest = Request<
  // params
  { id: string, state: string },
  // response
  boolean
>;