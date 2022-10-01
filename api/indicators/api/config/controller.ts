import indConfigModel from '../../../../models/indicators/config';
import {
  GetIndicatorConfigRequest,
  CreateIndicatorConfigRequest,
  UpdateIndicatorConfigRequest,
  UpdateIndicatorStateRequest
} from "./interface";


export default {

  async get(req: GetIndicatorConfigRequest) {
    req.res.json(await indConfigModel.get(req.params.ind_id));
  },

  async create(req: CreateIndicatorConfigRequest) {
    req.res.json(await indConfigModel.create(req.params.id, {
      TYPE: req.body.type,
      INTERVALS: req.body.intervals,
      EVALUATION_DAY: req.body.evaluation_day,
      KPI_MIN: req.body.kpi_min,
      KPI_MAX: req.body.kpi_max
    }));
  },

  async update(req: UpdateIndicatorConfigRequest) {
    req.res.json(await indConfigModel.update(req.params.id, {
      INTERVALS: req.body.intervals,
      EVALUATION_DAY: req.body.evaluation_day,
      KPI_MIN: req.body.kpi_min,
      KPI_MAX: req.body.kpi_max
    }));
  },

  async updateState(req: UpdateIndicatorStateRequest) {
    req.res.json(await indConfigModel.updateState(req.params.id, +(!!req.params.state) as (0 | 1)));
  }
}