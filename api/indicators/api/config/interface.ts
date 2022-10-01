import { Request } from "express";
import { IndicatorArgument, IndicatorConfig, IndicatorInterval, IndicatorType } from "../../../../models/indicators/config/interface";

export type GetIndicatorConfigRequest = Request<
  // params
  { ind_id: string },
  // response
  IndicatorConfig
>;

export type CreateIndicatorConfigRequest = Request<
  // params
  { id: string },
  // response
  Partial<IndicatorConfig>,
  // body
  {
    indicator_id: string;

    type?: IndicatorType;

    intervals?: IndicatorInterval;
    evaluation_day?: number;

    kpi_min?: number;
    kpi_max?: number;
  }
>;

export type UpdateIndicatorConfigRequest = Request<
  // params
  { id: string },
  // response
  boolean,
  // body
  { 
    intervals?: IndicatorInterval; 
    evaluation_day?: number;
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