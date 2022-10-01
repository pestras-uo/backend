import { Request } from "express";
import { IndicatorEqConfig, IndicatorArgument } from "models/indicators/equation/interface";

export type GetIndicatorEqConfigRequest = Request<
  // params
  { id: string },
  // response
  IndicatorEqConfig
>;

export type GetIndicatorArgumentsRequest = Request<
  // params
  { id: string },
  // response
  IndicatorArgument[]
>;

export type CreateIndicatorEqConfigRequest = Request<
  // params
  { id: string },
  // response
  boolean,
  // body
  {
    equation: string;
    clone_categories: 0 | 1;
    arguments: {
      argument_id: string;
      variable: string;
      value_column: string;
    }[]
  }
>;

export type UpdateIndicatorEqConfigRequest = Request<
  // params
  { id: string },
  // response
  boolean,
  // body
  {
    equation: string;
    clone_categories: 0 | 1;
    arguments: {
      argument_id: string;
      variable: string;
      value_column: string;
    }[]
  }
>;