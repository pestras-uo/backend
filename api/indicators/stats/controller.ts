import { CreateIndStatsConReq, GetIndStatsConfByIdReq, GetIndStatsConfReq, UpdateIndStatsConfReq } from "./interfaces";
import statsModel from '../../../models/indicators/stats-config';
import pubSub from "../../../misc/pub-sub";

export default {

  async get(req: GetIndStatsConfReq) {
    req.res.json(await statsModel.get(req.params.id));
  },

  async getById(req: GetIndStatsConfByIdReq) {
    req.res.json(await statsModel.getById(req.params.stats_id));
  },

  async create(req: CreateIndStatsConReq) {
    const statsConfig = await statsModel.create(req.params.id, req.body);

    req.res.json(statsConfig);

    pubSub.emit('publish', {
      action: req.res.locals.action,
      issuer: req.res.locals.issuer,
      entity_id: `${req.params.id}/${statsConfig.id}`
    });
  },

  async update(req: UpdateIndStatsConfReq) {
    req.res.json(await statsModel.update(req.params.stats_id, req.params.id, req.body));

    pubSub.emit('publish', {
      action: req.res.locals.action,
      issuer: req.res.locals.issuer,
      entity_id: `${req.params.id}/${req.params.stats_id}`
    });
  }
}