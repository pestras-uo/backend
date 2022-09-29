import { Request } from "express";
import { IndicatorArgument, IndicatorConfig } from "../../models/indicators/indicator-config/interface";

export type GetIndicatorConfigRequest = Request<
  // params
  { id: string },
  // response
  IndicatorConfig
>;



export type GetIndicatorArgumentsRequest = Request<
  // params
  { id: string },
  // response
  IndicatorArgument[]
>;



export type CreateIndicatorConfigRequest = Request<
  // params
  any,
  // response
  Partial<IndicatorConfig>,
  // body
  {
    indicator_id: string;

    intervals?: 1 | 3 | 6 | 12;
    kpi_min?: number;
    kpi_max?: number;

    readings_view?: string;
    values_columns?: string[];

    equation?: string;
    evaluation_day?: number;
    args: { id: string; variable: string; }[];
  }
>;



export type UpdateIndicatorIntervalRequest = Request<
  // params
  { id: string },
  // response
  Date,
  // body
  { intervals: number; }
>;



export type UpdateIndicatorKPIsRequest = Request<
  // params
  { id: string },
  // response
  Date,
  // body
  { min?: number; max?: number; }
>;

export type UpdateIndicatorEquationRequest = Request<
  // params
  { id: string },
  // response
  boolean,
  // body
  { equation: string; args: { id: string; variable: string; column: string }[]; }
>;

export type UpdateIndicatorEvalDayRequest = Request<
  // params
  { id: string },
  // response
  boolean,
  // body
  { day: number; }
>;