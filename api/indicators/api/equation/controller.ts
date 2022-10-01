import { CreateIndicatorEqConfigRequest, GetIndicatorArgumentsRequest, GetIndicatorEqConfigRequest, UpdateIndicatorEqConfigRequest } from "./interfaces";
import eqModel from 'models/indicators/equation';

export default {

  async get(req: GetIndicatorEqConfigRequest) {
    req.res.json(await eqModel.get(req.params.id));
  },

  async getArguments(req: GetIndicatorArgumentsRequest) {
    req.res.json(await eqModel.getArguments(req.params.id));
  },

  async create(req: CreateIndicatorEqConfigRequest) {
    req.res.json(await eqModel.create(
      req.params.id,
      {
        EQUATION: req.body.equation,
        CLONE_CATEGORIES: req.body.clone_categories
      },
      req.body.arguments.map(a => ({
        ARGUMENT_ID: a.argument_id,
        VARIABLE: a.variable,
        VALUE_COLUMN: a.value_column
      }))));
  },

  async update(req: UpdateIndicatorEqConfigRequest) {
    req.res.json(await eqModel.create(
      req.params.id,
      {
        EQUATION: req.body.equation,
        CLONE_CATEGORIES: req.body.clone_categories
      },
      req.body.arguments.map(a => ({
        ARGUMENT_ID: a.argument_id,
        VARIABLE: a.variable,
        VALUE_COLUMN: a.value_column
      }))));
  },
}