import { Request } from "express";
import { StatsConfig } from "models/indicators/stats-config/interface";

export type GetIndStatsConfReq = Request<
  // params
  { id: string },
  // response
  StatsConfig[]
>;

export type GetIndStatsConfByIdReq = Request<
  // params  
  { id: string, stats_id: string },
  // response
  StatsConfig
>;

export type CreateIndStatsConReq = Request<
  // params
  { id: string },
  // response
  StatsConfig,
  // body
  Omit<StatsConfig, 'id' | 'indicator_id'>
>;

export type UpdateIndStatsConfReq = Request<
  // params
  { id: string, stats_id: string },
  // response
  boolean,
  // body
  Omit<StatsConfig, 'id' | 'indicator_id'>
>;