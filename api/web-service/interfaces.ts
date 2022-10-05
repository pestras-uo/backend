import { Request } from "express";
import { IndicatorWebServiceConfig } from "../../models/web-service/interface";

export type GetIndicatorWebServiceConfigRequest = Request<
  // params
  { id: string },
  // response
  IndicatorWebServiceConfig
>;

export type CreateIndicatorWebServiceConfifRequest = Request<
  // params
  { id: string },
  // reponse
  boolean,
  // body
  {}
>;

export type UpdateIndicatorWebServiceConfifRequest = Request<
  // params
  { id: string },
  // reponse
  boolean,
  // body
  {}
>;