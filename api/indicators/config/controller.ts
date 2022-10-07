import pubSub from '../../../misc/pub-sub';
import indConfigModel from '../../../models/indicators/config';
import {
  GetIndicatorConfigRequest,
  UpdateIndicatorConfigRequest,
  UpdateIndicatorStateRequest,
  GetIndicatorArgsRequest,
  CreatManualIndicatorConfigRequest,
  CreateComputationalIndicatorRequest,
  CreateViewIndicatorRequest
} from "./interface";


export default {

  async get(req: GetIndicatorConfigRequest) {
    req.res.json(await indConfigModel.get(req.params.id));
  },

  async getArguments(req: GetIndicatorArgsRequest) {
    req.res.json(await indConfigModel.getArguments(req.params.id));
  },

  async createManual(req: CreatManualIndicatorConfigRequest) {
    req.res.json(await indConfigModel.createManualIndicator(
      req.params.id, {
      reading_value_name_ar: req.body.reading_value_name_ar,
      reading_value_name_en: req.body.reading_value_name_en,
      intervals: req.body.intervals,
      evaluation_day: req.body.evaluation_day,
      require_approval: req.body.require_approval,
      kpi_min: req.body.kpi_min,
      kpi_max: req.body.kpi_max
    }, req.body.additional_columns));

    pubSub.emit('publish', {
      action: req.res.locals.action,
      issuer: req.res.locals.issuer,
      entity_id: req.params.id
    });
  },

  async createComputational(req: CreateComputationalIndicatorRequest) {
    req.res.json(await indConfigModel.createComputationalIndicator(
      req.params.id, {
      reading_value_name_ar: req.body.reading_value_name_ar,
      reading_value_name_en: req.body.reading_value_name_en,
      intervals: req.body.intervals,
      evaluation_day: req.body.evaluation_day,
      equation: req.body.equation,
      kpi_min: req.body.kpi_min,
      kpi_max: req.body.kpi_max
    }, req.body.args));

    pubSub.emit('publish', {
      action: req.res.locals.action,
      issuer: req.res.locals.issuer,
      entity_id: req.params.id
    });
  },

  async createView(req: CreateViewIndicatorRequest) {
    req.res.json(await indConfigModel.createViewIndicator(
      req.params.id, {
      reading_value_name_ar: req.body.reading_value_name_ar,
      reading_value_name_en: req.body.reading_value_name_en,
      intervals: req.body.intervals,
      evaluation_day: req.body.evaluation_day,
      view_name: req.body.view_name,
      kpi_min: req.body.kpi_min,
      kpi_max: req.body.kpi_max
    }, req.body.additional_columns));

    pubSub.emit('publish', {
      action: req.res.locals.action,
      issuer: req.res.locals.issuer,
      entity_id: req.params.id
    });
  },

  async update(req: UpdateIndicatorConfigRequest) {
    req.res.json(await indConfigModel.update(req.params.id, {
      reading_value_name_ar: req.body.reading_value_name_ar,
      reading_value_name_en: req.body.reading_value_name_en,
      intervals: req.body.intervals,
      evaluation_day: req.body.evaluation_day,
      kpi_min: req.body.kpi_min,
      kpi_max: req.body.kpi_max
    }));

    pubSub.emit('publish', {
      action: req.res.locals.action,
      issuer: req.res.locals.issuer,
      entity_id: req.params.id
    });
  },

  async updateState(req: UpdateIndicatorStateRequest) {
    req.res.json(await indConfigModel.updateState(req.params.id, +req.params.state));

    pubSub.emit('publish', {
      action: req.res.locals.action,
      issuer: req.res.locals.issuer,
      entity_id: req.params.id
    });
  }
}