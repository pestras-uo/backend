import { CreateIndStatsConReq, GetIndStatsConfByIdReq, GetIndStatsConfReq, UpdateIndStatsConfReq } from "./interfaces";
import statsModel from '../../../models/indicators/stats-config';

export default {

  async get(req: GetIndStatsConfReq) {
    req.res.json(await statsModel.get(req.params.id));
  },

  async getById(req: GetIndStatsConfByIdReq) {
    req.res.json(await statsModel.getById(req.params.stats_id));
  },

  async create(req: CreateIndStatsConReq) {
    req.res.json(await statsModel.create(req.params.id, req.body));
  },

  async update(req: UpdateIndStatsConfReq) {
    req.res.json(await statsModel.update(req.params.stats_id, req.params.id, req.body));
  }
}