import { Router } from "express";
import auth from "../../../middlewares/auth";
import validate from "../../../middlewares/validate";
import controller from "./controller";
import { IndicatorConfigValidators } from "./validators";

export default Router()
  .get(
    '/',
    auth(["indicators.config.get.one"]),
    controller.get
  )
  .get(
    '/arguments',
    auth(["indicators.config.get.arguments"]),
    controller.getArguments
  )
  .post(
    '/manual',
    validate(IndicatorConfigValidators.CREATE_MANUAL),
    auth(["indicators.config.create.manual"]),
    controller.createManual
  )
  .post(
    '/computational',
    validate(IndicatorConfigValidators.CREATE_COMPUTATIONAL),
    auth(["indicators.config.create.computational"]),
    controller.createComputational
  )
  .post(
    '/view',
    validate(IndicatorConfigValidators.CREATE_VIEW),
    auth(["indicators.config.create.view"]),
    controller.createView
  )
  .put(
    '/',
    validate(IndicatorConfigValidators.UPDATE),
    auth(["indicators.config.update.one"]),
    controller.update
  )
  .put(
    '/state/:state',
    auth(["indicators.config.update.state"]),
    controller.updateState
  );
