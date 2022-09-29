import { Router } from "express";
import auth from "../../middlewares/auth";
import validate from "../../middlewares/validate";
import controller from "./controller";
import { IndicatorConfigValidators } from "./validators";

export default Router()
  .get(
    '/:id',
    auth(["indicators.config.get.one"]),
    controller.get
  )
  .get(
    '/:id/arguments',
    auth(["indicators.config.get.arguments"]),
    controller.getArguments
  )
  .post(
    '/',
    validate(IndicatorConfigValidators.CREATE),
    auth(["indicators.config.create"]),
    controller.create
  )
  .put(
    '/:id/intervals',
    validate(IndicatorConfigValidators.UPDATE_INTERVALS),
    auth(["indicators.config.update.intervals"]),
    controller.updateIntervals
  )
  .put(
    '/:id/kpis',
    validate(IndicatorConfigValidators.UPDATE_KPIS),
    auth(["indicators.config.update.kpis"]),
    controller.updateKpis
  )
  .put(
    '/:id/equation',
    validate(IndicatorConfigValidators.UPDATE_EQUATION),
    auth(["indicators.config.update.equation"]),
    controller.updateEquation
  )
  .put(
    '/:id/evaluation-day',
    validate(IndicatorConfigValidators.UPDATE_EVAL_DAY),
    auth(["indicators.config.update.evaluation-day"]),
    controller.updateEvaluationDay
  );