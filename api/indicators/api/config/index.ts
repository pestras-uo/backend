import { Router } from "express";
import auth from "../../../../middlewares/auth";
import validate from "../../../../middlewares/validate";
import controller from "./controller";
import { IndicatorConfigValidators } from "./validators";

export default Router()
  .get(
    '/',
    auth(["indicators.config.get.one"]),
    controller.get
  )
  .post(
    '/',
    validate(IndicatorConfigValidators.CREATE),
    auth(["indicators.config.create"]),
    controller.create
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