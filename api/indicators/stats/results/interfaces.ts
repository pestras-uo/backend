import { Request } from "express";
import { DescStatsResult } from "../../../../models/indicators/stats-results/interface";

export type GetStatsResultReq = Request<
  // params
  { id: string, stats_id: string },
  // response
  DescStatsResult
>;