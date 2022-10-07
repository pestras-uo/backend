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
  .get(
    '/arguments',
    auth("indicator-config.get.arguments"),
    controller.getArguments
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
    '/view',
    validate(IndicatorConfigValidators.CREATE_VIEW),
    auth("indicator-config.create.view"),
    controller.createView
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
  );
