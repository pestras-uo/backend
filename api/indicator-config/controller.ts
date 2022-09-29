import indConfigModel from '../../models/indicators/indicator-config';
import { 
  CreateIndicatorConfigRequest,
  GetIndicatorArgumentsRequest,
  GetIndicatorConfigRequest,
  UpdateIndicatorEquationRequest,
  UpdateIndicatorEvalDayRequest,
  UpdateIndicatorIntervalRequest,
  UpdateIndicatorKPIsRequest
} from "./interface";


export default {

  async get(req: GetIndicatorConfigRequest) {
    req.res.json(await indConfigModel.get(req.params.id));
  },

  async getArguments(req: GetIndicatorArgumentsRequest) {
    req.res.json(await indConfigModel.getArguments(req.params.id));
  },

  async create(req: CreateIndicatorConfigRequest) {
    req.res.json(await indConfigModel.create({
      INDICATOR_ID: req.body.indicator_id,
      INTERVALS: req.body.intervals,
      KPI_MIN: req.body.kpi_min,
      KPI_MAX: req.body.kpi_max,
      READINGS_VIEW: req.body.readings_view,
      EQUATION: req.body.equation,
      EVALUATION_DAY: req.body.evaluation_day
    }, req.body.args));
  },

  async updateIntervals(req: UpdateIndicatorIntervalRequest) {
    req.res.json(await indConfigModel.updateIntervals(req.params.id, req.body.intervals));
  },

  async updateKpis(req: UpdateIndicatorKPIsRequest) {
    req.res.json(await indConfigModel.updateKpi(req.params.id, req.body.min, req.body.max));
  },

  async updateEquation(req: UpdateIndicatorEquationRequest) {
    req.res.json(await indConfigModel.updateEquation(req.params.id, req.body.equation, req.body.args));
  },

  async updateEvaluationDay(req: UpdateIndicatorEvalDayRequest) {
    req.res.json(await indConfigModel.updateEvaluationtionDay(req.params.id, req.body.day));
  }
}