import pubSub from '../../../misc/pub-sub';
import indConfigModel from '../../../models/indicators/config';
import {
  GetIndicatorConfigRequest,
  UpdateIndicatorConfigRequest,
  UpdateIndicatorStateRequest,
  CreatManualIndicatorConfigRequest,
  CreateComputationalIndicatorRequest,
  CreateExternalIndicatorRequest,
  UpdateExternalIndicatorRequest,
  SplitIndicatorRequest
} from "./interface";


export default {

  async get(req: GetIndicatorConfigRequest) {
    req.res.json(await indConfigModel.get(req.params.id));
  },

  async createManual(req: CreatManualIndicatorConfigRequest) {
    req.res.json(await indConfigModel.createManualIndicator(req.params.id, req.body));

    pubSub.emit('publish', {
      action: req.res.locals.action,
      issuer: req.res.locals.user.id,
      entities_ids: [req.params.id]
    });
  },

  async createComputational(req: CreateComputationalIndicatorRequest) {
    req.res.json(await indConfigModel.createComputationalIndicator(req.params.id, req.body));

    pubSub.emit('publish', {
      action: req.res.locals.action,
      issuer: req.res.locals.user.id,
      entities_ids: [req.params.id]
    });
  },

  async createExternal(req: CreateExternalIndicatorRequest) {
    req.res.json(await indConfigModel.createExternalIndicator(req.params.id, req.body));

    pubSub.emit('publish', {
      action: req.res.locals.action,
      issuer: req.res.locals.user.id,
      entities_ids: [req.params.id]
    });
  },

  async split(req: SplitIndicatorRequest) {
    req.res.json(await indConfigModel.splitIndicator(
      req.params.id,
      req.body.categorial_column,
      req.res.locals.user.id  
    ));

    pubSub.emit('publish', {
      action: req.res.locals.action,
      issuer: req.res.locals.user.id,
      entities_ids: [req.params.id]
    });
  },

  async update(req: UpdateIndicatorConfigRequest) {
    req.res.json(await indConfigModel.update(req.params.id, req.body));

    pubSub.emit('publish', {
      action: req.res.locals.action,
      issuer: req.res.locals.user.id,
      entities_ids: [req.params.id]
    });
  },

  async updateState(req: UpdateIndicatorStateRequest) {
    req.res.json(await indConfigModel.updateState(req.params.id, +req.params.state));

    pubSub.emit('publish', {
      action: req.res.locals.action,
      issuer: req.res.locals.user.id,
      entities_ids: [req.params.id]
    });
  },

  async updateExternalIndicatorConfig(req: UpdateExternalIndicatorRequest) {
    req.res.json(await indConfigModel.updateExternalIndicatorConfig(
      req.params.id,
      req.body.source_name,
      req.body.filter_options,
      req.body.columns
    ));

    pubSub.emit('publish', {
      action: req.res.locals.action,
      issuer: req.res.locals.user.id,
      entities_ids: [req.params.id]
    });
  }
}