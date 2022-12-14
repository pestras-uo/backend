import { Router } from "express";
import auth from "../../../middlewares/auth";
import validate from "../../../middlewares/validate";
import controller from "./controller";
import { IndicatorConfigValidators } from "./validators";

export default Router()
  .get(
    '/',
    auth("indicator-config.get.one"),
    controller.get
  )
  .post(
    '/manual',
    validate(IndicatorConfigValidators.CREATE_MANUAL),
    auth("indicator-config.create.manual"),
    controller.createManual
  )
  .post(
    '/computational',
    validate(IndicatorConfigValidators.CREATE_COMPUTATIONAL),
    auth("indicator-config.create.computational"),
    controller.createComputational
  )
  .post(
    '/external',
    validate(IndicatorConfigValidators.CREATE_EXTERNAL),
    auth("indicator-config.create.external"),
    controller.createExternal
  )
  .post(
    '/split',
    validate(IndicatorConfigValidators.SPLIT),
    auth("indicator-config.create.split"),
    controller.split
  )
  .put(
    '/',
    validate(IndicatorConfigValidators.UPDATE),
    auth("indicator-config.update.one"),
    controller.update
  )
  .put(
    '/state/:state',
    auth("indicator-config.update.state"),
    controller.updateState
  )
  .put(
    '/external',
    auth("indicator-config.update.external"),
    controller.updateExternalIndicatorConfig
  )
